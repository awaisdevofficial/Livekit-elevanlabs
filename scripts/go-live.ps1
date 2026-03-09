# Quick check that Resona is live at https://resonaai.duckdns.org
# Run from project root: .\scripts\go-live.ps1

$base = "https://resonaai.duckdns.org"
$timeout = 10

Write-Host "`n=== Resona live check ===" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec $timeout
    Write-Host "  OK   App (HTTPS)     $base/  ->  HTTP $($r.StatusCode)" -ForegroundColor Green
} catch { Write-Host "  FAIL App            $base/  ->  $($_.Exception.Message)" -ForegroundColor Red }

try {
    $r = Invoke-WebRequest -Uri "$base/api/health" -UseBasicParsing -TimeoutSec $timeout
    Write-Host "  OK   API (HTTPS)     $base/api/health  ->  HTTP $($r.StatusCode)" -ForegroundColor Green
} catch { Write-Host "  FAIL API            $base/api/health  ->  $($_.Exception.Message)" -ForegroundColor Red }

Write-Host "`n  Live URL: $base" -ForegroundColor White
Write-Host "  Sign in, create an agent, and run a test call.`n" -ForegroundColor Gray
