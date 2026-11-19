param(
  [Parameter(Mandatory = $true)][string]$SourceDirectory,
  [Parameter(Mandatory = $true)][string]$ArchivePath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.Compression.ZipFile]::CreateFromDirectory(
  $SourceDirectory,
  $ArchivePath,
  [System.IO.Compression.CompressionLevel]::Optimal,
  $false,
  $utf8
)
