param([Parameter(Mandatory=$true)][string]$Script, [Parameter(Mandatory=$true)][string]$Report)
$ErrorActionPreference='Stop'
$result = (& npx --yes --package @playwright/cli playwright-cli -s=universe-v3 run-code --filename $Script --raw 2>&1 | Out-String)
$result | Set-Content -LiteralPath $Report
try {
  $parsed = $result | ConvertFrom-Json
  if ($parsed.PSObject.Properties.Name -contains 'passed') { $parsed | Select-Object passed,total,failures,runtime | ConvertTo-Json -Depth 5 }
  else { Write-Output "Report saved: $Report" }
} catch { Write-Output $result; throw 'Browser run did not return a JSON report.' }
