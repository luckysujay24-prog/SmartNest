@echo off
title Stop SmartNest Servers
color 0c

echo =====================================================================
echo                     STOPPING SMARTNEST SERVERS
echo =====================================================================
echo.

cd /d "%~dp0"

echo Stopping services on Port 3000 (Frontend) and Port 5000 (Backend)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
    echo [OK] Stopped process on Port 3000 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
    echo [OK] Stopped process on Port 5000 (PID %%a)
)

echo.
echo =====================================================================
echo   All SmartNest background servers have been stopped.
echo =====================================================================
echo.
pause
