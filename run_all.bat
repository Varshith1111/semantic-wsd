@echo off
title SemanticWSD Launcher
echo ========================================================
echo Launching SemanticWSD: Backend + Frontend
echo ========================================================
start "SemanticWSD Backend" cmd /c ""%~dp0run_backend.bat""
timeout /t 3 /nobreak >nul
start "SemanticWSD Frontend" cmd /c ""%~dp0run_frontend.bat""
echo.
echo Both servers are launching:
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo   - Swagger:  http://localhost:8000/docs
echo ========================================================
