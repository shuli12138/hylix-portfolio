$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostName = '127.0.0.1'
$port = 5173
$url = "http://$hostName`:$port/"
$viteEntry = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'

Set-Location $projectRoot

function Wait-ForSite {
  param([int]$TimeoutSeconds = 8)

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 400
    }
  } while ((Get-Date) -lt $deadline)

  return $false
}

Write-Host ''
Write-Host '作品集本地预览修复工具' -ForegroundColor White
Write-Host '----------------------------------------' -ForegroundColor DarkGray

if (Wait-ForSite -TimeoutSeconds 2) {
  Write-Host '检测到本地网页服务正常运行。' -ForegroundColor Green
  Start-Process $url
  Write-Host "已打开 $url" -ForegroundColor Gray
  exit 0
}

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
  Write-Host "无法自动修复：端口 $port 已被其他程序占用。" -ForegroundColor Yellow
  Write-Host "进程 ID：$($listener.OwningProcess)" -ForegroundColor Yellow
  if ($process) {
    Write-Host "程序：$($process.Name)" -ForegroundColor Yellow
    Write-Host "启动信息：$($process.CommandLine)" -ForegroundColor DarkGray
  }
  Write-Host '脚本没有关闭该程序，请确认后再处理。' -ForegroundColor Yellow
  Read-Host '按 Enter 键退出'
  exit 2
}

$nodeCandidates = @(
  (Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),
  "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
  "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
$nodeExe = $nodeCandidates | Select-Object -First 1

if (-not $nodeExe) {
  Write-Host '无法自动修复：没有找到 Node.js。' -ForegroundColor Yellow
  Write-Host '请先安装 Node.js LTS，或把安装位置告诉我。' -ForegroundColor Yellow
  Read-Host '按 Enter 键退出'
  exit 3
}

if (-not (Test-Path -LiteralPath $viteEntry)) {
  Write-Host '无法自动修复：项目依赖不完整，找不到 Vite。' -ForegroundColor Yellow
  Write-Host '脚本没有自动联网安装依赖，请先确认是否允许安装项目依赖。' -ForegroundColor Yellow
  Read-Host '按 Enter 键退出'
  exit 4
}

Write-Host '本地网页服务未响应，正在重新启动本项目...' -ForegroundColor Cyan
$arguments = "`"$viteEntry`" --host $hostName --port $port"
Start-Process -FilePath $nodeExe -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Normal

if (Wait-ForSite -TimeoutSeconds 10) {
  Write-Host '修复成功，本地网页服务已恢复。' -ForegroundColor Green
  Start-Process $url
  Write-Host "已打开 $url" -ForegroundColor Gray
  exit 0
}

Write-Host '启动后仍然没有响应。请保留新打开的服务窗口，并把窗口中的提示发给我。' -ForegroundColor Yellow
Read-Host '按 Enter 键退出'
exit 5
