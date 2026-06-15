# Setup GitHub Rulesets for Deskhand Repository
# Requires GitHub CLI (gh) installed and authenticated.

$ErrorActionPreference = "Stop"

# 1. Check if gh CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "[-] GitHub CLI (gh) is not installed." -ForegroundColor Red
    Write-Host "[*] Please install it using your preferred method:" -ForegroundColor Yellow
    Write-Host "    - winget install --id GitHub.cli" -ForegroundColor Green
    Write-Host "    - scoop install gh" -ForegroundColor Green
    Write-Host "    - Download from: https://cli.github.com/" -ForegroundColor Green
    exit 1
}

# 2. Check gh CLI authentication status
Write-Host "[*] Checking GitHub authentication status..." -ForegroundColor Cyan
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Not authenticated with GitHub. Starting login..." -ForegroundColor Red
    gh auth login -s "repo,admin:org"
} else {
    Write-Host "[+] Authenticated successfully." -ForegroundColor Green
}

# 3. Get repository info
$repoInfo = gh repo view --json nameWithOwner | ConvertFrom-Json
$ownerRepo = $repoInfo.nameWithOwner
Write-Host "[*] Targeting repository: $ownerRepo" -ForegroundColor Cyan

# 4. Check/Create develop branch locally and push to remote
Write-Host "[*] Ensuring develop branch exists locally and remotely..." -ForegroundColor Cyan
$currentBranch = (git branch --show-current).Trim()

# Stash changes if any (should be clean, but just in case)
$status = git status --porcelain
if ($status) {
    Write-Host "[*] Stashing uncommitted changes temporarily..." -ForegroundColor Yellow
    git stash
}

# Ensure main branch is up-to-date
Write-Host "[*] Checking out and updating main..." -ForegroundColor Cyan
git checkout main
git pull origin main

# Check if develop branch exists locally
$developExistsLocal = git show-ref --verify --quiet refs/heads/develop
if ($developExistsLocal) {
    Write-Host "[+] Local develop branch already exists. Checking out..." -ForegroundColor Green
    git checkout develop
    git pull origin develop -X ours --rebase -q
} else {
    Write-Host "[+] Creating local develop branch..." -ForegroundColor Green
    git checkout -b develop
}

# Push develop to remote
Write-Host "[*] Pushing develop branch to origin..." -ForegroundColor Cyan
git push -u origin develop

# Return to main if that was active
if ($currentBranch -eq "main") {
    git checkout main
}

# Pop stash if stashed
if ($status) {
    Write-Host "[*] Restoring stashed changes..." -ForegroundColor Yellow
    git stash pop
}

# 5. Set default branch on GitHub to develop
Write-Host "[*] Setting default branch on GitHub to 'develop'..." -ForegroundColor Cyan
gh repo edit $ownerRepo --default-branch develop --delete-branch-on-merge

# 6. Apply Rulesets
Write-Host "[*] Applying Repository Rulesets..." -ForegroundColor Cyan

$rulesets = gh api "repos/$ownerRepo/rulesets" | ConvertFrom-Json

function Apply-Ruleset {
    param(
        [string]$Name,
        [string]$FilePath
    )

    $existing = $rulesets | Where-Object { $_.name -eq $Name }
    $payload = Get-Content $FilePath -Raw

    if ($existing) {
        $id = $existing.id
        Write-Host "[*] Updating existing ruleset '$Name' (ID: $id)..." -ForegroundColor Yellow
        gh api --method PUT "repos/$ownerRepo/rulesets/$id" --input $FilePath > $null
        Write-Host "[+] Ruleset '$Name' updated successfully." -ForegroundColor Green
    } else {
        Write-Host "[*] Creating new ruleset '$Name'..." -ForegroundColor Yellow
        gh api --method POST "repos/$ownerRepo/rulesets" --input $FilePath > $null
        Write-Host "[+] Ruleset '$Name' created successfully." -ForegroundColor Green
    }
}

Apply-Ruleset -Name "Protect main and develop" -FilePath ".github/rulesets/protect-main-develop.json"
Apply-Ruleset -Name "Only feature branches can be created" -FilePath ".github/rulesets/only-feature-branches.json"

Write-Host "[+] All configurations successfully applied to $ownerRepo!" -ForegroundColor Green
