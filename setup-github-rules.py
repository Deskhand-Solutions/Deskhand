import os
import sys
import json
import subprocess

try:
    import requests
except ImportError:
    print("[*] Installing requests dependency...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def run_git_cmd(args):
    try:
        result = subprocess.run(args, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"[-] Git command failed: {' '.join(args)}")
        print(f"    Error: {e.stderr.strip()}")
        sys.exit(1)

def main():
    print("=" * 60)
    print("  Deskhand GitHub Rulesets & Branch Configuration via Python")
    print("=" * 60)

    # 1. Gather Information
    repo_default = "Deskhand-Solutions/Deskhand"
    repo_input = input(f"Enter GitHub Repository (owner/repo) [{repo_default}]: ").strip()
    owner_repo = repo_input if repo_input else repo_default

    print("\nTo apply rulesets, you need a GitHub Personal Access Token (PAT).")
    print("The token needs 'Administration' write permission (under Repository permissions) or 'repo' scope (classic token).")
    print("Generate one here: https://github.com/settings/tokens")
    token = input("Enter your GitHub PAT: ").strip()

    if not token:
        print("[-] Access token is required to proceed.")
        sys.exit(1)

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    # 2. Local branch setup
    print("\n[*] Setting up local and remote develop branch...")
    
    # Check status
    status = run_git_cmd(["git", "status", "--porcelain"])
    has_stash = False
    if status:
        print("[*] Stashing uncommitted changes temporarily...")
        run_git_cmd(["git", "stash"])
        has_stash = True

    # Get current branch
    current_branch = run_git_cmd(["git", "branch", "--show-current"])

    # Update main
    run_git_cmd(["git", "checkout", "main"])
    run_git_cmd(["git", "pull", "origin", "main"])

    # Ensure develop branch exists
    branches = run_git_cmd(["git", "branch"])
    if "develop" in branches:
        print("[+] Checking out local develop branch...")
        run_git_cmd(["git", "checkout", "develop"])
        run_git_cmd(["git", "pull", "origin", "develop", "-X", "ours", "-q"])
    else:
        print("[+] Creating local develop branch...")
        run_git_cmd(["git", "checkout", "-b", "develop"])

    # Push develop to remote
    print("[*] Pushing develop branch to origin...")
    run_git_cmd(["git", "push", "-u", "origin", "develop"])

    # Restore branch state
    if current_branch == "main":
        run_git_cmd(["git", "checkout", "main"])

    if has_stash:
        print("[*] Restoring stashed changes...")
        run_git_cmd(["git", "stash", "pop"])

    # 3. Update default branch on GitHub
    print("\n[*] Updating default branch to 'develop' on GitHub...")
    url_repo = f"https://api.github.com/repos/{owner_repo}"
    resp = requests.patch(url_repo, headers=headers, json={
        "default_branch": "develop",
        "delete_branch_on_merge": True
    })

    if resp.status_code == 200:
        print("[+] Successfully set default branch to 'develop'.")
    else:
        print(f"[-] Failed to update default branch. Status: {resp.status_code}")
        print(resp.text)
        sys.exit(1)

    # 4. Fetch existing rulesets
    url_rulesets = f"https://api.github.com/repos/{owner_repo}/rulesets"
    resp_rules = requests.get(url_rulesets, headers=headers)
    if resp_rules.status_code != 200:
        print(f"[-] Failed to retrieve rulesets. Status: {resp_rules.status_code}")
        print(resp_rules.text)
        sys.exit(1)

    existing_rulesets = resp_rules.json()

    def apply_ruleset(name, file_path):
        # Load ruleset config
        with open(file_path, "r", encoding="utf-8") as f:
            payload = json.load(f)

        existing = next((r for r in existing_rulesets if r["name"] == name), None)

        if existing:
            ruleset_id = existing["id"]
            print(f"[*] Updating existing ruleset '{name}' (ID: {ruleset_id})...")
            url_update = f"{url_rulesets}/{ruleset_id}"
            resp_action = requests.put(url_update, headers=headers, json=payload)
        else:
            print(f"[*] Creating new ruleset '{name}'...")
            resp_action = requests.post(url_rulesets, headers=headers, json=payload)

        if resp_action.status_code in [200, 201]:
            print(f"[+] Ruleset '{name}' applied successfully.")
        else:
            print(f"[-] Failed to apply ruleset '{name}'. Status: {resp_action.status_code}")
            print(resp_action.text)

    # Apply both rulesets
    rulesets_dir = os.path.join(".github", "rulesets")
    apply_ruleset("Protect main and develop", os.path.join(rulesets_dir, "protect-main-develop.json"))
    apply_ruleset("Only feature branches can be created", os.path.join(rulesets_dir, "only-feature-branches.json"))

    print("\n[+] All configurations successfully applied!")

if __name__ == "__main__":
    main()
