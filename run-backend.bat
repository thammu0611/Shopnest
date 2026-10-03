@echo off
REM Starts the Spring Boot API on http://localhost:8080
cd /d "%~dp0backend"
call mvn spring-boot:run
pause
