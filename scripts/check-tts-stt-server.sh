#!/usr/bin/env bash
# Run ON the TTS/STT server (18.141.177.170).
# SSH: ssh -i "tts-stt-server.pem" ubuntu@18.141.177.170
# Then: bash scripts/check-tts-stt-server.sh  (or copy this file to server and run)

set -e
echo "=== TTS/STT server checks (Piper + Whisper) ==="

# Piper TTS — port 8880
echo ""
echo "--- Piper TTS (port 8880) ---"
if command -v curl &>/dev/null; then
  curl -sf "http://127.0.0.1:8880/health" && echo " OK" || echo " FAIL (is Piper running?)"
else
  (echo "GET /health HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n" | timeout 2 nc -q 1 127.0.0.1 8880 | head -1) || echo "Piper not responding on 8880"
fi
echo "Listening on 8880:"
ss -tlnp 2>/dev/null | grep 8880 || netstat -tlnp 2>/dev/null | grep 8880 || true

# Whisper STT — port 8002 (OpenAI-compatible proxy)
echo ""
echo "--- Whisper STT (port 8002) ---"
if command -v curl &>/dev/null; then
  # Just check port responds (POST would need multipart body)
  curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://127.0.0.1:8002/" 2>/dev/null && echo " (port open)" || echo " FAIL or not OpenAI-compatible (is Whisper proxy on 8002?)"
else
  (timeout 2 bash -c 'echo -e "GET / HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n" | nc 127.0.0.1 8002' | head -1) || echo "Whisper not responding on 8002"
fi
echo "Listening on 8002:"
ss -tlnp 2>/dev/null | grep 8002 || netstat -tlnp 2>/dev/null | grep 8002 || true

# Processes
echo ""
echo "--- Processes (piper / whisper) ---"
ps aux | grep -E "piper|whisper|uvicorn" | grep -v grep || true

# Piper voices
echo ""
echo "--- Piper voices dir ---"
if [ -d "/home/ubuntu/piper-voices" ]; then
  ls -la /home/ubuntu/piper-voices/ | head -5
  [ -f /home/ubuntu/piper-voices/voices.json ] && echo "voices.json exists"
else
  echo "Directory /home/ubuntu/piper-voices not found"
fi

echo ""
echo "=== Done ==="
