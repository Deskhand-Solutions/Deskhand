# Sync agent-rules/*.md -> .cursor/rules/*.mdc and .claude/rules/*.md
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $root "agent-rules"
$cursorDir = Join-Path $root ".cursor\rules"
$claudeDir = Join-Path $root ".claude\rules"

if (-not (Test-Path $sourceDir)) {
    throw "Missing agent-rules directory: $sourceDir"
}

New-Item -ItemType Directory -Force -Path $cursorDir | Out-Null
New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null

function Parse-Frontmatter {
    param([string]$Content)
    if ($Content -notmatch '(?s)^---\r?\n(.*?)\r?\n---\r?\n(.*)$') {
        return @{ Meta = @{}; Body = $Content.Trim() }
    }
    $yaml = $Matches[1]
    $body = $Matches[2].Trim()
    $meta = @{}
    foreach ($line in $yaml -split "`n") {
        if ($line -match '^\s*(\w+)\s*:\s*(.+)\s*$') {
            $meta[$Matches[1]] = $Matches[2].Trim()
        }
    }
    return @{ Meta = $meta; Body = $body }
}

function Build-CursorFrontmatter {
    param($Meta)
    $lines = @("---")
    if ($Meta.description) { $lines += "description: $($Meta.description)" }
    if ($Meta.paths) { $lines += "globs: $($Meta.paths)" }
    $always = if ($Meta.apply -eq "always") { "true" } else { "false" }
    $lines += "alwaysApply: $always"
    $lines += "---"
    return ($lines -join "`n")
}

function Build-ClaudeFrontmatter {
    param($Meta)
    $lines = @("---")
    if ($Meta.description) { $lines += "description: $($Meta.description)" }
    if ($Meta.apply -ne "always" -and $Meta.paths) { $lines += "paths: $($Meta.paths)" }
    $lines += "---"
    return ($lines -join "`n")
}

$files = Get-ChildItem -Path $sourceDir -Filter "*.md" -File |
    Where-Object { $_.Name -ne "README.md" }

foreach ($file in $files) {
    $parsed = Parse-Frontmatter -Content (Get-Content -Path $file.FullName -Raw -Encoding UTF8)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    $cursorContent = Build-CursorFrontmatter -Meta $parsed.Meta
    $cursorContent += "`n`n" + $parsed.Body
    Set-Content -Path (Join-Path $cursorDir "$baseName.mdc") -Value $cursorContent -Encoding UTF8 -NoNewline

    $claudeContent = Build-ClaudeFrontmatter -Meta $parsed.Meta
    $claudeContent += "`n`n" + $parsed.Body
    Set-Content -Path (Join-Path $claudeDir "$baseName.md") -Value $claudeContent -Encoding UTF8 -NoNewline
}

Write-Host "Synced $($files.Count) rule(s) to .cursor/rules and .claude/rules"
