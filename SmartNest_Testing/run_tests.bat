@echo off
echo ========================================================
echo   SmartNest Selenium Automation Test Suite (Pytest)
echo ========================================================
echo.
echo NOTE: Ensure the SmartNest application is running at:
echo       http://localhost:3000
echo.
echo Running tests...
python -m pytest -v -s
echo.
pause
