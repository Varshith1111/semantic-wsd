@echo off
title SemanticWSD Backend
echo ========================================================
echo Starting SemanticWSD Backend (FastAPI + NLP Engine)
echo ========================================================
cd /d "%~dp0backend"
set PYTHONPATH=%~dp0backend
set HF_HUB_OFFLINE=1
set TRANSFORMERS_OFFLINE=1
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend encountered an error.
    pause
)
