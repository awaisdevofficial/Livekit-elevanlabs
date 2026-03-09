#!/usr/bin/env bash
# Run on TTS/STT server (18.141.177.170).
# Stops Piper and Whisper proxy, optionally removes app files. You then re-copy project and run deploy.
# Usage:
#   bash scripts/clean-and-redeploy-tts.sh           # restart services only (reloads code if you already updated files)
#   bash scripts/clean-and-redeploy-tts.sh full-wipe # stop, remove piper/whisper app files; then copy project and run deploy-tts.sh

set -e

if [ "$1" = "full-wipe" ]; then
  echo "=== Full wipe: stopping Piper and Whisper proxy ==="
  sudo systemctl stop piper-tts.service 2>/dev/null || true
  sudo systemctl stop whisper-proxy.service 2>/dev/null || true
  # Optionally stop whisper-cpp (backend for proxy) – uncomment if you want to restart that too
  # sudo systemctl stop whisper-cpp.service 2>/dev/null || true

  echo "Removing app files (keeping piper-voices and whisper models)..."
  rm -f /home/ubuntu/piper_server.py
  rm -f /home/ubuntu/whisper_proxy.py
  rm -rf /home/ubuntu/__pycache__
  echo ""
  echo "Done. Copy piper_server.py and whisper_proxy.py (if used) to /home/ubuntu/, then run:"
  echo "  bash scripts/deploy-tts.sh"
  exit 0
fi

echo "=== Restarting Piper and Whisper proxy ==="
sudo systemctl restart piper-tts.service
sudo systemctl restart whisper-proxy.service
echo "=== Done. Check: curl -s http://127.0.0.1:8880/health && curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8002/ ==="
