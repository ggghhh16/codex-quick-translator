param([string]$NodePath, [string]$CodexPath, [ValidatePattern('^[a-p]{32}$')][string]$ExtensionId)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localDir = Join-Path $projectRoot '.local'
$runtimeDir = Join-Path $localDir 'runtime'
New-Item -ItemType Directory -Force $localDir,$runtimeDir,(Join-Path $localDir 'work') | Out-Null
if (-not $NodePath) {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($nodeCommand) { $NodePath = $nodeCommand.Source }
  else {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $bundledNode) { $NodePath = $bundledNode }
  }
}
if (-not $NodePath -or -not (Test-Path -LiteralPath $NodePath)) { throw 'Node.js 20+ is required. Use -NodePath with the full node.exe path.' }
if (-not $CodexPath) {
  $codexCommand = Get-Command codex.exe -ErrorAction SilentlyContinue
  if ($codexCommand) { $CodexPath = $codexCommand.Source }
  else {
    $codexBin = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
    $latestCodex = Get-ChildItem -LiteralPath $codexBin -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | ForEach-Object { Join-Path $_.FullName 'codex.exe' } | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($latestCodex) { $CodexPath = $latestCodex }
  }
}
if (-not $CodexPath -or -not (Test-Path -LiteralPath $CodexPath)) { throw 'Codex is required. Install Codex and sign in first, or use -CodexPath.' }
$NodePath = (Resolve-Path -LiteralPath $NodePath).Path
$CodexPath = (Resolve-Path -LiteralPath $CodexPath).Path
$stableNode = Join-Path $runtimeDir 'node.exe'
if ($NodePath -ne $stableNode) { Copy-Item -LiteralPath $NodePath -Destination $stableNode -Force }
$version = & $stableNode -p 'process.versions.node'
if ([int]($version.Split('.')[0]) -lt 20) { throw 'Node.js 20+ is required.' }
$utf8 = New-Object System.Text.UTF8Encoding($false)
$config = @{codexPath=$CodexPath;pinCodexPath=$PSBoundParameters.ContainsKey('CodexPath')} | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path $localDir 'host-config.json'),$config,$utf8)
$manifestPath = Join-Path $projectRoot 'extension\manifest.json'
if (-not $ExtensionId) {
  $ExtensionId = & $stableNode (Join-Path $PSScriptRoot 'extension-id.cjs') $manifestPath
  if ($LASTEXITCODE -ne 0 -or $ExtensionId -notmatch '^[a-p]{32}$') { throw 'Cannot derive the extension ID.' }
}
$launcher = Join-Path $localDir 'host.cmd'
$hostScript = Join-Path $projectRoot 'native\host.cjs'
# Batch launcher contains only installer-resolved paths. Reject cmd metacharacters.
foreach ($file in @($stableNode,$hostScript)) { if ($file -match '[%&!^\r\n]') { throw 'Please install in a path without cmd metacharacters.' } }
[IO.File]::WriteAllText($launcher, "@echo off`r`n`"$stableNode`" `"$hostScript`"`r`n", [Text.Encoding]::Default)
$nativeManifest = @{name='com.local.codex_quick_translator';description='Local Codex Quick Translator';path=$launcher;type='stdio';allowed_origins=@("chrome-extension://$ExtensionId/")} | ConvertTo-Json
$nativeManifestPath = Join-Path $localDir 'com.local.codex_quick_translator.json'
[IO.File]::WriteAllText($nativeManifestPath,$nativeManifest,$utf8)
$registryPath = 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.local.codex_quick_translator'
New-Item -Path $registryPath -Force | Out-Null
Set-Item -Path $registryPath -Value $nativeManifestPath
Write-Host "Installed local host for extension: $ExtensionId"
Write-Host "Load unpacked extension from: $(Join-Path $projectRoot 'extension')"
Write-Host 'Chrome: chrome://extensions -> Developer mode -> Load unpacked'
