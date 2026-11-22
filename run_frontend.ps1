Write-Host "Starting SemanticWSD Frontend (React + Vite)..." -ForegroundColor Cyan
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"
npm run dev
