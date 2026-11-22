@echo off
title Push SemanticWSD to GitHub
echo ========================================================
echo Pushing SemanticWSD to GitHub
echo Remote: https://github.com/Varshith1111/semantic-wsd.git
echo ========================================================
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo Successfully pushed to https://github.com/Varshith1111/semantic-wsd
    echo ========================================================
) else (
    echo.
    echo Push failed. Please make sure:
    echo 1. You created the repository 'semantic-wsd' on https://github.com/new
    echo 2. You have permission to push to your GitHub account.
)
pause
