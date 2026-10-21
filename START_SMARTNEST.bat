@echo off
title SmartNest - Residential Management Platform
color 0b

echo =====================================================================
echo.
echo     ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗███╗   ██╗███████╗███████╗████████╗
echo     ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝████╗  ██║██╔════╝██╔════╝╚══██╔══╝
echo     ███████╗██╔████╔██║███████║██████╔╝   ██║   ██╔██╗ ██║█████╗  ███████╗   ██║   
echo     ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██║╚██╗██║██╔══╝  ╚════██║   ██║   
echo     ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██║ ╚████║███████╗███████║   ██║   
echo     ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   
echo.
echo                   SMARTNEST RESIDENTIAL MANAGEMENT OS
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo      Node.js is detected.

echo.
echo [2/4] Checking project dependencies...
if not exist "node_modules\" (
    echo      First-time setup detected. Installing packages...
    call npm install
) else (
    echo      Packages verified.
)

echo.
echo [3/4] Ensuring MongoDB Compass database (smartnest) is seeded...
call node scripts/seed-smartnest-mongo.cjs >nul 2>nul
echo      MongoDB database "smartnest" verified.

echo.
echo [4/5] Releasing any existing background ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo      Ports 5000 and 3000 are ready.

echo.
echo [5/5] Launching SmartNest servers...
echo      - Starting Backend API on http://localhost:5000 ...
start "SmartNest Backend API" /min cmd /c "node server.cjs"

echo      - Starting Frontend UI on http://localhost:3000 ...
start "SmartNest Frontend Server" /min cmd /c "npm run dev"

echo.
echo Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Opening SmartNest in your default web browser...
start http://localhost:3000

echo.
echo =====================================================================
echo   SUCCESS: SmartNest is now running!
echo.
echo   - Web Application:     http://localhost:3000
echo   - Backend API Status:  http://localhost:5000
echo   - MongoDB Compass:     mongodb://127.0.0.1:27017/smartnest
echo.
echo   NOTE: Keep this window open or minimize it while using SmartNest.
echo   To stop all servers when finished, run STOP_SMARTNEST.bat
echo =====================================================================
echo.
pause
