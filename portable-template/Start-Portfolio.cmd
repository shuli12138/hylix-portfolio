@echo off
setlocal
cd /d "%~dp0"

set "POWERSHELL=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%POWERSHELL%" (
  echo Windows PowerShell is required but was not found.
  pause
  exit /b 1
)

"%POWERSHELL%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Portfolio.ps1"
if errorlevel 1 (
  echo.
  echo The portfolio could not be started. See the message above.
  pause
)
