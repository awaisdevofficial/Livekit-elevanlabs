#!/usr/bin/env bash
# Run on TTS/STT server after piper_server.py (and optionally whisper_proxy) are in place.
# Usage: run from project dir on server, or copy scripts + piper_server.py to /home/ubuntu and run.

set -e
# If run from repo: copy piper_server to home and restart
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$REPO_ROOT/scripts/piper_server.py" ]; then
  cp "$REPO_ROOT/scripts/piper_server.py" /home/ubuntu/piper_server.py
  echo "Copied piper_server.py to /home/ubuntu/"
fi

echo "=== Restarting Piper TTS and Whisper proxy ==="
sudo systemctl restart piper-tts.service
sudo systemctl restart whisper-proxy.service
echo "=== Done ==="
curl -s http://127.0.0.1:8880/health || true
echo ""
