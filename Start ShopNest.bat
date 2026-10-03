@echo off
REM Double-click to launch ShopNest (API + UI) using MySQL.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-shopnest.ps1"
if errorlevel 1 pause
