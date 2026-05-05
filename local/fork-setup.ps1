#Requires -Version 5.1
<#
.SYNOPSIS
  Bootstrap this Paperclip clone after git clone (Node, pnpm, deps, starter .env).
  Run from repo root:  pwsh -File ./local/fork-setup.ps1
  Or:                   powershell -NoProfile -File ./local/fork-setup.ps1
#>
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host "Repo: $Root"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Install Node.js LTS from https://nodejs.org/ , then re-run this script."
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm not found. Enabling via corepack..."
    corepack enable
    corepack prepare pnpm@latest --activate
}

pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frozen lockfile install failed; retrying without --frozen-lockfile..."
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "pnpm install failed."
        exit 1
    }
}

$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) {
    $example = Join-Path $Root ".env.example"
    if (Test-Path $example) {
        Copy-Item $example $envFile
        Write-Host "Created .env from .env.example — edit if your dev DB/port differ."
    }
}

Write-Host ""
Write-Host "Next: cd to repo root, run: pnpm dev"
Write-Host "Optional Windows log-on autostart: pwsh -File ./scripts/register-paperclip-autostart-task.ps1"
Write-Host "See local/FORK-SETUP.md for full notes."
