$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$siteRoot = [IO.Path]::GetFullPath((Join-Path $packageRoot 'site'))

if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html') -PathType Leaf)) {
  throw "The site folder is missing index.html. Keep this file next to the site folder."
}

function Get-FreePort {
  param([int]$StartingPort = 5173)

  for ($candidate = $StartingPort; $candidate -lt ($StartingPort + 100); $candidate++) {
    $probe = New-Object Net.Sockets.TcpListener ([Net.IPAddress]::Loopback, $candidate)
    try {
      $probe.Start()
      return $candidate
    } catch {
      continue
    } finally {
      $probe.Stop()
    }
  }

  throw 'No available local port was found.'
}

function Get-ContentType {
  param([string]$Extension)

  switch ($Extension.ToLowerInvariant()) {
    '.html' { return 'text/html; charset=utf-8' }
    '.css'  { return 'text/css; charset=utf-8' }
    '.js'   { return 'application/javascript; charset=utf-8' }
    '.json' { return 'application/json; charset=utf-8' }
    '.png'  { return 'image/png' }
    '.jpg'  { return 'image/jpeg' }
    '.jpeg' { return 'image/jpeg' }
    '.webp' { return 'image/webp' }
    '.gif'  { return 'image/gif' }
    '.svg'  { return 'image/svg+xml' }
    '.ico'  { return 'image/x-icon' }
    '.webm' { return 'video/webm' }
    '.mp4'  { return 'video/mp4' }
    '.mp3'  { return 'audio/mpeg' }
    '.wav'  { return 'audio/wav' }
    '.woff' { return 'font/woff' }
    '.woff2' { return 'font/woff2' }
    default { return 'application/octet-stream' }
  }
}

function Send-Response {
  param(
    [Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [string]$ContentType,
    [Int64]$ContentLength,
    [Int64]$RangeStart = 0,
    [Int64]$RangeEnd = -1,
    [Int64]$TotalLength = -1,
    [string]$FilePath,
    [string]$Body,
    [string]$Method = 'GET'
  )

  $statusLine = "HTTP/1.1 $StatusCode $Reason"
  $headers = @(
    $statusLine
    "Content-Type: $ContentType"
    "Content-Length: $ContentLength"
    'Accept-Ranges: bytes'
    'Cache-Control: no-cache'
    'Connection: close'
  )
  if ($RangeEnd -ge $RangeStart -and $TotalLength -ge 0) {
    $headers += "Content-Range: bytes $RangeStart-$RangeEnd/$TotalLength"
  }
  $headers += ''
  $headers += ''
  $headerBytes = [Text.Encoding]::ASCII.GetBytes(($headers -join "`r`n"))
  $Stream.Write($headerBytes, 0, $headerBytes.Length)

  if ($Method -eq 'HEAD' -or $ContentLength -eq 0) {
    return
  }

  if ($null -ne $FilePath) {
    $file = [IO.File]::OpenRead($FilePath)
    try {
      $file.Seek($RangeStart, [IO.SeekOrigin]::Begin) | Out-Null
      $remaining = $ContentLength
      $buffer = New-Object byte[] 65536
      while ($remaining -gt 0) {
        $read = $file.Read($buffer, 0, [Math]::Min($buffer.Length, $remaining))
        if ($read -le 0) { break }
        $Stream.Write($buffer, 0, $read)
        $remaining -= $read
      }
    } finally {
      $file.Dispose()
    }
    return
  }

  $bodyBytes = [Text.Encoding]::UTF8.GetBytes($Body)
  $Stream.Write($bodyBytes, 0, $bodyBytes.Length)
}

function Handle-Client {
  param([Net.Sockets.TcpClient]$Client)

  $stream = $Client.GetStream()
  $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
  try {
    $requestLine = $reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) { return }

    $headers = @{}
    while ($true) {
      $line = $reader.ReadLine()
      if ($null -eq $line -or $line -eq '') { break }
      $separator = $line.IndexOf(':')
      if ($separator -gt 0) {
        $name = $line.Substring(0, $separator).Trim().ToLowerInvariant()
        $value = $line.Substring($separator + 1).Trim()
        $headers[$name] = $value
      }
    }

    $requestParts = $requestLine -split ' ', 3
    if ($requestParts.Count -lt 2) { return }
    $method = $requestParts[0].ToUpperInvariant()
    $requestPath = ($requestParts[1] -split '\?', 2)[0]

    if ($method -ne 'GET' -and $method -ne 'HEAD') {
      Send-Response $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' 18 -Body 'Method not allowed.' -Method $method
      return
    }

    $decodedPath = [Uri]::UnescapeDataString($requestPath)
    $relativePath = $decodedPath.TrimStart('/') -replace '/', '\'
    $candidatePath = if ([string]::IsNullOrWhiteSpace($relativePath)) {
      Join-Path $siteRoot 'index.html'
    } else {
      Join-Path $siteRoot $relativePath
    }
    $fullPath = [IO.Path]::GetFullPath($candidatePath)
    $sitePrefix = $siteRoot.TrimEnd('\') + '\'

    if (-not $fullPath.StartsWith($sitePrefix, [StringComparison]::OrdinalIgnoreCase)) {
      Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' 10 -Body 'Forbidden.' -Method $method
      return
    }

    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
      if ([string]::IsNullOrEmpty([IO.Path]::GetExtension($relativePath))) {
        $fullPath = Join-Path $siteRoot 'index.html'
      } else {
        Send-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' 10 -Body 'Not found.' -Method $method
        return
      }
    }

    $fileInfo = Get-Item -LiteralPath $fullPath
    $fileLength = [Int64]$fileInfo.Length
    $start = [Int64]0
    $end = $fileLength - 1
    $status = 200
    $reason = 'OK'

    if ($headers.ContainsKey('range') -and $headers['range'] -match '^bytes=(\d*)-(\d*)$' -and $fileLength -gt 0) {
      $rangeStartText = $Matches[1]
      $rangeEndText = $Matches[2]
      if ($rangeStartText -eq '') {
        $suffixLength = [Int64]$rangeEndText
        $start = [Math]::Max(0, $fileLength - $suffixLength)
      } else {
        $start = [Int64]$rangeStartText
        if ($rangeEndText -ne '') { $end = [Math]::Min($fileLength - 1, [Int64]$rangeEndText) }
      }
      if ($start -ge $fileLength -or $start -gt $end) {
        Send-Response $stream 416 'Range Not Satisfiable' 'text/plain; charset=utf-8' 22 -Body 'Range not satisfiable.' -Method $method
        return
      }
      $status = 206
      $reason = 'Partial Content'
    }

    $contentLength = $end - $start + 1
    $contentType = Get-ContentType ([IO.Path]::GetExtension($fullPath))
    Send-Response $stream $status $reason $contentType $contentLength $start $end $fileLength $fullPath -Method $method
  } catch {
    try {
      $message = 'Server error.'
      Send-Response $stream 500 'Internal Server Error' 'text/plain; charset=utf-8' $message.Length -Body $message -Method 'GET'
    } catch {}
  } finally {
    $reader.Dispose()
    $stream.Dispose()
    $Client.Dispose()
  }
}

$port = Get-FreePort
$server = New-Object Net.Sockets.TcpListener ([Net.IPAddress]::Loopback, $port)
$server.Start()
$url = "http://127.0.0.1:$port/"

Write-Host ''
Write-Host 'Portfolio is running.' -ForegroundColor Green
Write-Host "Address: $url"
Write-Host 'Keep this window open while browsing.'
Write-Host 'Press Ctrl+C to stop the local server.'
Start-Process $url

try {
  while ($server.Server.IsBound) {
    $client = $server.AcceptTcpClient()
    Handle-Client $client
  }
} finally {
  $server.Stop()
}
