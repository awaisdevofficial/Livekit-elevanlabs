# Run from your PC to check both Resona servers (no SSH required).
# Usage: .\scripts\check-servers.ps1

$TTS_HOST = "18.141.177.170"
$MAIN_HOST = "18.141.140.150"
$timeout = 8

function Test-Endpoint {
    param($Name, $Url)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $timeout
        Write-Host "  OK   $Name  ->  HTTP $($r.StatusCode)" -ForegroundColor Green
        return $true
    } catch {
        $msg = if ($_.Exception.Message -match "404") { "404" } elseif ($_.Exception.Message -match "timeout") { "timeout" } else { $_.Exception.Message }
        Write-Host "  FAIL $Name  ->  $msg" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n=== TTS/STT server $TTS_HOST ===" -ForegroundColor Cyan
Test-Endpoint "Piper TTS (8880) /" "http://${TTS_HOST}:8880/"
Test-Endpoint "Piper TTS (8880) /health" "http://${TTS_HOST}:8880/health"
Test-Endpoint "Piper TTS (8880) /v1/voices" "http://${TTS_HOST}:8880/v1/voices"
try {
    $r = Invoke-WebRequest -Uri "http://${TTS_HOST}:8002/" -UseBasicParsing -TimeoutSec $timeout
    Write-Host "  OK   Whisper STT (8002)  ->  HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
    $err = $_.Exception.Response; $code = [int]$err.StatusCode
    if ($code -ge 400 -and $code -lt 500) { Write-Host "  OK   Whisper STT (8002)  ->  up (HTTP $code)" -ForegroundColor Green }
    else { Write-Host "  FAIL Whisper STT (8002)  ->  timeout or closed" -ForegroundColor Red }
}

Write-Host "`n=== Main server $MAIN_HOST ===" -ForegroundColor Cyan
Test-Endpoint "LiveKit (7880)" "http://${MAIN_HOST}:7880/"
Test-Endpoint "Backend (8001) /health" "http://${MAIN_HOST}:8001/health"
Test-Endpoint "Frontend (3001)" "http://${MAIN_HOST}:3001/"
# If you use a domain with HTTPS:
# Test-Endpoint "Backend (HTTPS)" "https://resonaai.duckdns.org/api/health"

Write-Host "`nNote: Backend/Frontend may be behind HTTPS only (no direct port from internet)." -ForegroundColor Gray
Write-Host "See SERVER-CHECKS.md for SSH checks on each server.`n" -ForegroundColor Gray
