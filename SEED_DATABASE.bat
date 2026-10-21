@echo off
title SmartNest - MongoDB Compass Data Seeder
color 0a

echo =====================================================================
echo           SMARTNEST: MONGODB COMPASS DATABASE SEEDER
echo =====================================================================
echo.

cd /d "%~dp0"

echo Connecting to local MongoDB at mongodb://127.0.0.1:27017/smartnest ...
echo Populating 12 collections and exporting JSON files to mongo-data\ ...
echo.

node scripts/seed-smartnest-mongo.cjs

echo.
echo =====================================================================
echo   Seeding complete! Open MongoDB Compass and explore database:
echo   "smartnest"
echo =====================================================================
echo.
pause
