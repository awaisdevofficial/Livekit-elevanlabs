# Fresh deploy: delete everything on servers and deploy from start

Use this when you want to wipe the project on both servers and redeploy from scratch.

---

## Main server (18.141.140.150)

### Option A – Reset containers only (keep project dir, rebuild)

1. SSH in:
   ```bash
   ssh -i "C:\Users\Mark Edward\Downloads\resona-main.pem" ubuntu@18.141.140.150
   ```
2. Run:
   ```bash
   cd /home/ubuntu/resona.ai
   bash scripts/clean-and-redeploy-main.sh
   ```
   This stops and removes all app containers (backend, frontend, agent_worker, redis), then runs `docker compose up -d --build`.

### Option B – Full wipe (delete project dir, then re-copy and deploy)

1. SSH in and run:
   ```bash
   cd /home/ubuntu/resona.ai
   bash scripts/clean-and-redeploy-main.sh full-wipe
   ```
   This stops containers, backs up `backend/.env.production` to `/tmp/resona.env.production.bak`, and deletes `/home/ubuntu/resona.ai`.

2. From your **PC**, copy the project back to the server (e.g. rsync or scp):
   ```powershell
   # PowerShell (from your project root, e.g. Desktop\resona.ai)
   scp -i "$env:USERPROFILE\Downloads\resona-main.pem" -r "c:\Users\Mark Edward\Desktop\resona.ai\*" ubuntu@18.141.140.150:/home/ubuntu/resona.ai/
   ```
   Or use **rsync** (if installed):
   ```bash
   rsync -avz -e "ssh -i resona-main.pem" --exclude node_modules --exclude .venv --exclude .git ./ ubuntu@18.141.140.150:/home/ubuntu/resona.ai/
   ```

3. SSH back in and restore env + deploy:
   ```bash
   ssh -i "..." ubuntu@18.141.140.150
   cp /tmp/resona.env.production.bak /home/ubuntu/resona.ai/backend/.env.production
   cd /home/ubuntu/resona.ai
   bash scripts/deploy-main.sh
   ```

**Note:** LiveKit and LiveKit SIP (if running as separate containers) are not removed by these scripts. Stop them manually if you want a full stack wipe.

---

## TTS/STT server (18.141.177.170)

### Option A – Restart services only (reload code)

1. SSH in:
   ```bash
   ssh -i "tts-stt-server.pem" ubuntu@18.141.177.170
   ```
2. If you already updated files (e.g. via scp), just restart:
   ```bash
   cd /home/ubuntu/resona.ai
   bash scripts/clean-and-redeploy-tts.sh
   ```
   Or without a repo on server, copy only the script and run:
   ```bash
   sudo systemctl restart piper-tts.service whisper-proxy.service
   ```

### Option B – Full wipe (remove app files, re-copy, deploy)

1. Copy the project to the server first (so you have the scripts), then SSH in:
   ```bash
   ssh -i "tts-stt-server.pem" ubuntu@18.141.177.170
   cd /home/ubuntu/resona.ai
   bash scripts/clean-and-redeploy-tts.sh full-wipe
   ```
2. Re-copy the project from your PC (or clone again), then deploy:
   ```bash
   # From PC: scp/rsync resona.ai to /home/ubuntu/resona.ai
   # Then on server:
   cd /home/ubuntu/resona.ai
   bash scripts/deploy-tts.sh
   ```
   `deploy-tts.sh` copies `scripts/piper_server.py` to `/home/ubuntu/` and restarts Piper and Whisper proxy.

---

## One-shot from your PC (PowerShell)

To **only reset and rebuild the main server** (Option A) without opening SSH yourself:

```powershell
cd "c:\Users\Mark Edward\Desktop\resona.ai"
Get-Content .\scripts\clean-and-redeploy-main.sh -Raw | ssh -i "$env:USERPROFILE\Downloads\resona-main.pem" ubuntu@18.141.140.150 "cd /home/ubuntu/resona.ai && bash -s"
```

To **full-wipe main** you must run the script on the server (it deletes the directory), then re-copy the project and run `deploy-main.sh` as in Option B above.
