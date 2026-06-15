#!/usr/bin/env bash
# Deskhand Project Verification Script
# Validates both Backend (Django) and Frontend (Vite/React) codebases.

set -euo pipefail

# Print styled messages
log_info() {
  echo -e "\033[1;34m[*] $1\033[0m"
}
log_success() {
  echo -e "\033[1;32m[+] $1\033[0m"
}
log_error() {
  echo -e "\033[1;31m[-] $1\033[0m"
}

ROOT_DIR="$(pwd)"

log_info "Starting local project verification..."

# 1. Frontend Checks
if [ -d "frontend" ]; then
  log_info "Validating React Frontend..."
  cd frontend

  # Install if node_modules missing
  if [ ! -d "node_modules" ]; then
    log_info "Installing frontend dependencies..."
    npm ci
  fi

  log_info "Running frontend linter..."
  npm run lint

  log_info "Running frontend tests..."
  npm run test

  log_info "Running frontend typecheck & production build..."
  npm run build

  cd "$ROOT_DIR"
  log_success "Frontend validation completed successfully."
else
  log_error "Frontend directory not found!"
  exit 1
fi

# 2. Backend Checks
if [ -d "backend" ]; then
  log_info "Validating Django Backend..."
  cd backend

  # Resolve virtualenv python executable
  if [ -f "venv/Scripts/python" ]; then
    PYTHON="venv/Scripts/python"
  elif [ -f "venv/bin/python" ]; then
    PYTHON="venv/bin/python"
  else
    log_info "Virtual environment python not found, falling back to global 'python'..."
    PYTHON="python"
  fi

  log_info "Using python: $PYTHON"

  log_info "Running Django system checks..."
  $PYTHON manage.py check

  log_info "Running Django migration dry-run check..."
  $PYTHON manage.py makemigrations --check --dry-run

  log_info "Running Django test suite..."
  $PYTHON runtests.py

  cd "$ROOT_DIR"
  log_success "Backend validation completed successfully."
else
  log_error "Backend directory not found!"
  exit 1
fi

log_success "All local verification checks passed! Your branch is ready to push."
