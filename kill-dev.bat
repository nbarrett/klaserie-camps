@echo off
REM Kill Wildtrack development processes (Windows batch launcher)
powershell -ExecutionPolicy Bypass -File "%~dp0kill-dev.ps1"
