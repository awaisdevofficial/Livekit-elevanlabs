# Server checks — Resona

Two servers:

| Server        | IP              | Key                 | Role                          |
|---------------|-----------------|---------------------|-------------------------------|
| **Main**      | 18.141.140.150  | `resona-main.pem`   | LiveKit, backend, frontend, agent |
| **TTS/STT**   | 18.141.177.170  | `tts-stt-server.pem`| Piper (8880), Whisper (8002)  |

---

## 1. TTS/STT server (18.141.177.170)

```bash
ssh -i "tts-stt-server.pem" ubuntu@18.141.177.170
```

### What must be running

- **Piper TTS** on port **8880**  
  - OpenAI-style endpoint: `POST /v1/audio/speech`  
  - Health: `GET /health`  
  - From this repo: `scripts/piper_server.py` → run with `uvicorn piper_server:app --host 0.0.0.0 --port 8880`
- **Whisper (OpenAI-compatible)** on port **8002**  
  - Endpoint: `POST /v1/audio/transcriptions` (multipart `file` + optional `language`)  
  - Use a Whisper.cpp proxy that exposes this path (e.g. [openai-whisper-api](https://github.com/ahmetoner/whisper-asr-webservice) or similar).

### Run checks on the TTS/STT server

```bash
# Copy script to server or run from repo
bash scripts/check-tts-stt-server.sh
```

### Start Piper (if not running)

```bash
cd /path/to/resona.ai
# If piper_server is in scripts/
python3 -m uvicorn scripts.piper_server:app --host 0.0.0.0 --port 8880
# Or if you copied piper_server.py to current dir:
python3 -m uvicorn piper_server:app --host 0.0.0.0 --port 8880
```

Use systemd or a process manager so it restarts. Example systemd unit name: `piper-tts.service`.

### Start Whisper proxy (port 8002)

Depends on how you deployed Whisper. Ensure:

- Process listens on `0.0.0.0:8002`
- Path `POST /v1/audio/transcriptions` exists and accepts multipart `file` (OpenAI format).

---

## 2. Main server (18.141.140.150)

```bash
ssh -i "C:\Users\Mark Edward\Downloads\resona-main.pem" ubuntu@18.141.140.150
```

### What must be running

- **Backend**: port 8000 (dev) or 8001 (prod Docker)
- **Frontend**: port 3000 (dev) or 3001 (prod Docker)
- **LiveKit**: port 7880
- **Redis**: port 6379
- **Agent worker**: one process (systemd `resona-agent` or Docker `agent_worker`)

### Run checks on the main server

```bash
bash scripts/check-main-server.sh
```

### Env and ports

- Backend and agent worker must have:
  - `PIPER_TTS_URL=http://18.141.177.170:8880/v1/audio/speech`
  - `WHISPER_STT_URL=http://18.141.177.170:8002/v1/audio/transcriptions`  
  **Use port 8002 for Whisper, not 8000.**
- If using Docker Compose prod: `docker compose -f docker-compose.prod.yml --env-file backend/.env.production up -d`
- If agent runs on host (systemd): ensure `backend/.env.production` has the same `PIPER_*` and `WHISPER_*` URLs and that the service uses it (`EnvironmentFile=`).

---

## 3. Quick fix checklist

- [ ] **TTS/STT server**: Piper listening on 0.0.0.0:8880, Whisper proxy on 0.0.0.0:8002.
- [ ] **Main server**: `WHISPER_STT_URL` uses port **8002** (not 8000). See `backend/.env` and `backend/.env.production`.
- [ ] **Main server**: Agent worker running (systemd or Docker) and loading the same env as backend (including `PIPER_TTS_URL`, `WHISPER_STT_URL`, `API_BASE_URL`, `LIVEKIT_*`).
- [ ] **Main server**: LiveKit running; backend/agent can reach it (e.g. `LIVEKIT_API_URL=http://127.0.0.1:7880` when on same host).
- [ ] **Firewall**: Main server can reach 18.141.177.170:8880 and 18.141.177.170:8002; your app/HTTPS proxy is allowed as needed.

---

## 4. Test from your machine (no SSH)

**PowerShell (recommended):**
```powershell
.\scripts\check-servers.ps1
```

**Manual curls:**
```bash
# Piper (8880) — use /v1/voices if /health returns 404 (old deploy)
curl -s "http://18.141.177.170:8880/health"
curl -s "http://18.141.177.170:8880/v1/voices"

# Whisper (8002) — timeout from internet often means firewall; backend/agent on main server can still reach it from inside AWS
curl -s -o /dev/null -w "%{http_code}" "http://18.141.177.170:8002/"

# Main: LiveKit is usually open; backend/frontend often only via HTTPS
curl -s "http://18.141.140.150:7880/"
curl -s "https://resonaai.duckdns.org/api/health"
```

**What you typically see:** Piper `/v1/voices` = 200 (TTS works). Whisper 8002 and backend 8001 may timeout from your PC if only allowed from same VPC or behind HTTPS.

**If the main server cannot reach TTS server (18.141.177.170:8002):** Open port **8002** in the TTS/STT server’s AWS security group (inbound) for the main server’s IP or VPC CIDR so the agent/backend can call Whisper.
