# Deskhand Project Verification Script (Windows PowerShell)
# Validates both Backend (Django) and Frontend (Vite/React) codebases.

$ErrorActionPreference = "Stop"

function Log-Info ($Message) {
    Write-Host "[*] $Message" -ForegroundColor Cyan
}

function Log-Success ($Message) {
    Write-Host "[+] $Message" -ForegroundColor Green
}

function Log-Error ($Message) {
    Write-Host "[-] $Message" -ForegroundColor Red
}

$rootDir = Get-Location

Log-Info "Starting local project verification (PowerShell)..."

# 1. Frontend Checks
if (Test-Path "frontend") {
    Log-Info "Validating React Frontend..."
    Set-Location "frontend"

    # Install if node_modules missing
    if (!(Test-Path "node_modules")) {
        Log-Info "Installing frontend dependencies..."
        npm ci
    }

    Log-Info "Verifying frontend lockfile synchronization (npm ci --dry-run)..."
    npm ci --dry-run

    Log-Info "Running frontend linter..."
    npm run lint

    Log-Info "Running frontend tests..."
    npm run test

    Log-Info "Running frontend typecheck & production build..."
    npm run build

    Set-Location $rootDir
    Log-Success "Frontend validation completed successfully."
} else {
    Log-Error "Frontend directory not found!"
    exit 1
}

# 2. Backend Checks
if (Test-Path "backend") {
    Log-Info "Validating Django Backend..."
    Set-Location "backend"

    # Resolve virtualenv python executable
    $python = "python"
    if (Test-Path "venv\Scripts\python.exe") {
        $python = "venv\Scripts\python.exe"
    }

    Log-Info "Using python: $python"

    Log-Info "Running Django system checks..."
    & $python manage.py check

    Log-Info "Running Django migration dry-run check..."
    & $python manage.py makemigrations --check --dry-run

    Log-Info "Running Django test suite..."
    & $python runtests.py

    Set-Location $rootDir
    Log-Success "Backend validation completed successfully."
} else {
    Log-Error "Backend directory not found!"
    exit 1
}

Log-Success "All local verification checks passed! Your branch is ready to push."
