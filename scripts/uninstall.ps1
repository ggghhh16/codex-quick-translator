$ErrorActionPreference = 'Stop'
$key = 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.local.codex_quick_translator'
if (Test-Path -LiteralPath $key) { Remove-Item -LiteralPath $key -Force }
Write-Host 'Native host registration removed. Remove the extension in chrome://extensions. Markdown notes remain unchanged.'
