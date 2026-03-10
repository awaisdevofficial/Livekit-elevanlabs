"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api, API_BASE_URL, getAuthToken } from "@/lib/api"

type TranscriptLine = {
  speaker: "user" | "agent"
  text: string
  timestamp: string
}

export default function LiveCallPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = (params?.roomId as string) || ""
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [agentState, setAgentState] = useState("listening")
  const [isTakenOver, setIsTakenOver] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferNumber, setTransferNumber] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // SSE connection (fetch with auth so we can send Bearer token)
  useEffect(() => {
    if (!roomId) return
    let mounted = true
    abortRef.current = new AbortController()

    async function connect() {
      const token = await getAuthToken()
      const url = `${API_BASE_URL}/v1/live-calls/${roomId}/stream`
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: abortRef.current?.signal,
      })
      if (!res.ok || !res.body) {
        if (mounted) setError("Could not connect to live stream")
        return
      }
      setError(null)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      while (mounted) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === "transcript" && mounted) {
                setTranscript((prev) => [
                  ...prev,
                  {
                    speaker: event.speaker || (event.role === "user" ? "user" : "agent"),
                    text: event.text || "",
                    timestamp: event.timestamp || new Date().toISOString(),
                  },
                ])
                setTimeout(
                  () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
                  50
                )
              }
              if (event.type === "state" && event.state && mounted) {
                setAgentState(event.state)
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    }
    connect()
    return () => {
      mounted = false
      abortRef.current?.abort()
    }
  }, [roomId])

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleTakeover = useCallback(async () => {
    try {
      const res = await api.post(`/v1/live-calls/${roomId}/takeover`, {})
      const data = res as { token?: string; livekit_url?: string }
      if (data.token && data.livekit_url) {
        setIsTakenOver(true)
        // Optional: open LiveKit room in new tab or embed
        window.open(
          `${data.livekit_url}?token=${encodeURIComponent(data.token)}`,
          "_blank",
          "noopener,noreferrer"
        )
      }
    } catch (e) {
      console.error(e)
    }
  }, [roomId])

  const handleHandback = useCallback(async () => {
    try {
      await api.post(`/v1/live-calls/${roomId}/handback`, {})
      setIsTakenOver(false)
    } catch (e) {
      console.error(e)
    }
  }, [roomId])

  const handleTransfer = useCallback(async () => {
    if (!transferNumber.trim()) return
    try {
      await api.post(`/v1/live-calls/${roomId}/transfer`, {
        to_number: transferNumber.trim(),
      })
      setShowTransferModal(false)
      setTransferNumber("")
    } catch (e) {
      console.error(e)
    }
  }, [roomId, transferNumber])

  const handleEndCall = useCallback(async () => {
    try {
      await api.post(`/v1/live-calls/${roomId}/end`, {})
      router.push("/calls")
    } catch (e) {
      console.error(e)
    }
  }, [roomId, router])

  const stateIcon: Record<string, string> = {
    listening: "👂",
    thinking: "💭",
    speaking: "🔊",
  }

  if (!roomId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <p>Missing room ID.</p>
        <Link href="/calls" className="ml-2 text-[#4DFFCE] underline">
          Back to calls
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0B0D10] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-semibold text-sm">LIVE</span>
          <span className="text-white/60 text-sm font-mono truncate max-w-[200px]">
            {roomId}
          </span>
          <Link
            href="/calls"
            className="text-xs text-white/50 hover:text-white/80"
          >
            ← Calls
          </Link>
        </div>
        <span className="font-mono text-[#4DFFCE]">{formatTime(elapsed)}</span>
      </div>

      {error && (
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-sm">
          {error}
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Status panel */}
        <div className="w-48 border-r border-white/10 flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
          <div className="text-4xl">
            {stateIcon[agentState] || "👂"}
          </div>
          <div className="text-sm text-white/60 capitalize">{agentState}</div>
          {isTakenOver && (
            <div className="mt-4 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
              You&apos;re in control
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcript.length === 0 && !error && (
            <p className="text-sm text-white/50">Waiting for conversation…</p>
          )}
          {transcript.map((line, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                line.speaker === "agent" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  line.speaker === "agent"
                    ? "bg-[#4DFFCE]/20 text-[#4DFFCE] border border-[#4DFFCE]/30"
                    : "bg-white/10 text-white/90 border border-white/10"
                }`}
              >
                <div className="text-xs text-white/50 mb-1">
                  {line.speaker === "agent" ? "🤖 Agent" : "👤 User"}
                </div>
                {line.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 px-6 py-4 bg-white/[0.03] border-t border-white/10">
        {!isTakenOver ? (
          <button
            onClick={handleTakeover}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium text-white"
          >
            🎤 Take Over
          </button>
        ) : (
          <button
            onClick={handleHandback}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white"
          >
            ↩ Hand Back to AI
          </button>
        )}
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white"
        >
          📞 Transfer
        </button>
        <button
          onClick={handleEndCall}
          className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium text-white"
        >
          🔴 End Call
        </button>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0B0D10] rounded-xl p-6 w-80 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Transfer Call</h3>
            <input
              type="tel"
              placeholder="+1234567890"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 rounded-lg text-sm mb-4 border border-white/10 focus:border-[#4DFFCE]/50 focus:ring-1 focus:ring-[#4DFFCE]/30 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
