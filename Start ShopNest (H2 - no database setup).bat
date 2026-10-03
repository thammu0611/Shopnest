@echo off
REM Double-click to launch ShopNest with an in-memory H2 database.
REM No MySQL and no password required. Data resets on every restart.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-shopnest.ps1" -Db h2
if errorlevel 1 pause
