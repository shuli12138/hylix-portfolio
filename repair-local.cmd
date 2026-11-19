@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0repair-local.ps1" (
  echo Repair script is missing.
  pause
  exit /b 1
)

if not exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
  echo Windows PowerShell is not available.
  pause
  exit /b 1
)

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0repair-local.ps1"
if errorlevel 1 (
  echo.
  echo Repair stopped. Read the message above before taking action.
)
pause
