#!/bin/bash
# Run on server after git push: pull, update .env, install deps, restart services.
set -e
cd /opt/resona/app || exit 1
git pull origin main

# Remove DEEPGRAM_API_KEY from backend .env if present
if [ -f backend/.env ]; then
  sed -i.bak '/^DEEPGRAM_API_KEY=/d' backend/.env 2>/dev/null || true
fi

# Backend venv: install/update deps (Cartesia plugin, no Deepgram)
if [ -d backend/.venv ]; then
  source backend/.venv/bin/activate
  pip install -r backend/requirements.txt
  deactivate
fi

sudo systemctl restart resona-backend resona-agent resona-frontend
echo "Done. Check: sudo systemctl status resona-backend resona-agent resona-frontend"
