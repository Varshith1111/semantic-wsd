@echo off
title SemanticWSD Frontend
echo ========================================================
echo Starting SemanticWSD Frontend (React + Vite Dashboard)
echo ========================================================
cd /d "%~dp0frontend"
call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Frontend encountered an error.
    pause
)
