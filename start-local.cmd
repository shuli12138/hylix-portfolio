@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE="
for /f "delims=" %%i in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%i"

if not defined NODE_EXE (
  set "LOCAL_NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
  if exist "%LOCAL_NODE%" set "NODE_EXE=%LOCAL_NODE%"
)

if not defined NODE_EXE (
  set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if exist "%CODEX_NODE%" set "NODE_EXE=%CODEX_NODE%"
)

if not defined NODE_EXE (
  echo 未检测到 Node.js。
  echo 请先从 https://nodejs.org/ 安装 LTS 版本，然后重新运行本文件。
  pause
  exit /b 1
)

if not exist "node_modules" (
  set "PACKAGE_MANAGER="
  where npm >nul 2>nul && set "PACKAGE_MANAGER=npm"
  if not defined PACKAGE_MANAGER (
    set "LOCAL_NPM=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
    if exist "%LOCAL_NPM%" set "PACKAGE_MANAGER=%LOCAL_NPM%"
  )
  if not defined PACKAGE_MANAGER (
    set "CODEX_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
    if exist "%CODEX_PNPM%" set "PACKAGE_MANAGER=%CODEX_PNPM%"
  )
  if not defined PACKAGE_MANAGER (
    echo 缺少项目依赖，请安装 Node.js LTS 后重新运行。
    pause
    exit /b 1
  )
  echo 正在首次安装依赖，请稍候...
  call "%PACKAGE_MANAGER%" install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo 正在启动作品集...
start "" http://localhost:5173
"%NODE_EXE%" "node_modules\vite\bin\vite.js" --host localhost
