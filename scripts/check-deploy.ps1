$r = Invoke-WebRequest -Uri 'https://kingdomads.netlify.app/' -UseBasicParsing
Write-Output "=== HEAD (first 1800 chars) ==="
Write-Output $r.Content.Substring(0, [Math]::Min(1800, $r.Content.Length))
Write-Output ""
Write-Output "=== Searching fonts.googleapis ==="
$r.Content -split "`n" | Select-String -Pattern "fonts.googleapis|fonts.gstatic|preload"
