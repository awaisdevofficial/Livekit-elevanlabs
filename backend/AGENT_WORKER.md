# Agent worker – run once

The agent worker handles **all** voice calls: **web test calls** (browser) and **Twilio/SIP phone calls**. The same process joins each LiveKit room and runs the voice agent, so env and fallback (e.g. OpenAI) apply to every call type.

## Voice call behavior (barge-in and response)

- **Interruptions:** The agent stops when you start speaking. Key settings in `agent_worker.py`:
  - `turn_detection="vad"` so the agent reacts to voice activity immediately (with `"stt"` it waited for speech-to-text, so it often finished its sentence first).
  - `use_remote_turn_detector=False` so **self-hosted LiveKit** uses only local VAD (Silero) for barge-in. The cloud barge-in service (`wss://agent-gateway.livekit.cloud/v1/bargein`) is LiveKit Cloud–only; self-hosted keys get 401 there, so we disable it.
  - `aec_warmup_duration=0` so barge-in works from the very start.
  - `min_interruption_duration=0.3`, `min_interruption_words=2` so brief noise/breath doesn’t trigger; real speech does.
  - `false_interruption_timeout=None` and `resume_false_interruption=False` so the agent does not auto-resume after you interrupt.
- **Fast response:** `preemptive_generation=True` and short prompts keep replies quick. TTS uses **streaming** with `streaming_latency` (env `ELEVENLABS_STREAMING_LATENCY`, 0–4; default 2) so audio starts playing as soon as the first chunks are ready. If the agent still doesn’t stop when you speak, check that only one worker is running and that the user’s mic is unmuted in the test call UI.

**No interruption / TTS keeps completing:** The worker only applies `aec_warmup_duration=0` and related options when the installed `livekit-agents` version supports them (1.5+). If the server has an older SDK, the agent uses defaults (e.g. 3s AEC warmup) and will not barge-in at the start. Upgrade on the server so barge-in works:

```bash
cd /opt/resona/app/backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart resona-agent
```

**CLI:** Use `python agent_worker.py start` (production) or `python agent_worker.py dev` (development). There is no `run` command.

**Port 8081 in use:** The worker’s HTTP server binds to 8081 by default. If you see “address already in use”, either:
- Run only one worker: stop the systemd worker before running manually (`sudo systemctl stop resona-agent` then `python agent_worker.py start`), or
- Use another port: `LIVEKIT_AGENT_HTTP_PORT=8082 python agent_worker.py start`

Only **one** agent worker process should be running per LiveKit server. If you run it in both places, you get duplicate workers and odd behavior (e.g. jobs claimed by both, LLM/API errors under load).

- **On the server (Ubuntu):** Run it **only** via systemd: `sudo systemctl start resona-agent`. Do **not** also run `python agent_worker.py start` in a terminal or venv on the same machine.
- **Local dev:** Run the worker in your venv only when you need to test; stop the server’s worker or use a different LiveKit dev server so only one worker is active.

## Check for duplicate workers (on server)

```bash
# Is the systemd service running?
sudo systemctl status resona-agent

# Any other python processes running the agent worker?
ps aux | grep agent_worker
# or
pgrep -af agent_worker
```

If you see the systemd service **and** another `python ... agent_worker` process, stop the manual one (e.g. exit the terminal or kill the PID).

## LLM connection errors (APIConnectionError / APIStatusError)

If logs show `APIConnectionError` or `APIStatusError` in `_llm_inference_task` / `llm_node`, the worker is failing to talk to the **Groq** API (LLM). Check:

**429 Rate limit:** If the error says `Rate limit reached ... tokens per day (TPD)` or `rate_limit_exceeded`, your Groq account has hit its daily token limit (e.g. 100k TPD on the free/on-demand tier). The agent worker can fall back to OpenAI when `OPENAI_API_KEY` is set (see below). Otherwise wait for the cooldown or upgrade at https://console.groq.com/settings/billing.

**OpenAI fallback:** Set `OPENAI_API_KEY` in the agent worker env (e.g. `backend/.env` or systemd) to use OpenAI (gpt-4o-mini) when Groq returns 429 or connection errors. The worker uses Groq first and switches to OpenAI automatically on failure. This applies to **all** calls (web test and Twilio/SIP).

**Calls and Twilio:** For Twilio and other phone calls, the backend creates a LiveKit room and the **same** agent worker joins it (via room metadata or SIP dispatch). Ensure the worker has `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `API_BASE_URL`, `INTERNAL_SECRET`, plus `DEEPGRAM_API_KEY`, `CARTESIA_API_KEY`, `GROQ_API_KEY` (and optionally `OPENAI_API_KEY`) so every call type works.

1. **GROQ_API_KEY** is set in the environment used by the agent worker (e.g. in the systemd unit’s env or `backend/.env`).
2. Server can reach Groq: `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models`.
3. Rate limits or quota on your Groq account.

Full error line:

```bash
sudo journalctl -u resona-agent -n 200 --no-pager
```

## Agent worker issues (test call / web call not connecting)

If the **backend** returns 200 for web-call-token but the **agent never joins** or the call fails:

1. **Worker must connect to the same LiveKit as the backend**
   - Worker uses `LIVEKIT_URL` (WebSocket), `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` from env (e.g. from `backend/.env` or the systemd unit).
   - On the server, `LIVEKIT_URL` can be the public URL (e.g. `wss://resonaai.duckdns.org/livekit`) or the internal one (e.g. `ws://127.0.0.1:7880`) if the worker runs on the same host as LiveKit. Keys must match the backend and LiveKit server.

2. **Worker needs to reach the backend for internal APIs**
   - `API_BASE_URL` must be the URL the worker can use to call the backend (e.g. `http://127.0.0.1:8000` or `http://172.31.18.18:8000` when the backend is in Docker on the same host).
   - `INTERNAL_SECRET` must match the backend’s `INTERNAL_SECRET` for `/internal/*` routes (e.g. transcript, default-agent).

3. **Required API keys in the worker’s env**
   - `DEEPGRAM_API_KEY` (STT), `GROQ_API_KEY` (LLM), `CARTESIA_API_KEY` (TTS). If any are missing, the worker can accept the job but will error when starting the voice session.

4. **Check worker logs**
   ```bash
   sudo journalctl -u resona-agent -n 100 --no-pager
   ```
   Look for “Agent job started room=…”, connection errors, or Groq/Deepgram/Cartesia errors.

5. **Systemd env**
   If the unit doesn’t load `backend/.env`, set the variables in the unit file (e.g. `Environment=LIVEKIT_URL=wss://...`) or use `EnvironmentFile=/opt/resona/app/backend/.env`.
