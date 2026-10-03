@echo off
REM Starts the React dev server on http://localhost:5173
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing frontend dependencies...
  call npm install
)
call npm run dev
pause
