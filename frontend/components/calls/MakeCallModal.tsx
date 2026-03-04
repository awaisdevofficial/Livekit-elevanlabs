"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MakeCallModal({ isOpen, onClose }: Props) {
  const qc = useQueryClient();
  const [toNumber, setToNumber] = useState("");
  const [agentId, setAgentId] = useState("");

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get("/v1/agents"),
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ["phone-numbers"],
    queryFn: () => api.get("/v1/phone-numbers"),
  });

  const importNumbers = useMutation({
    mutationFn: () => api.post("/v1/phone-numbers/import", {}),
    onSuccess: (data: any) => {
      toast.success(
        `Imported ${data.imported} number${data.imported !== 1 ? "s" : ""}. You can start a call now.`
      );
      qc.invalidateQueries({ queryKey: ["phone-numbers"] });
    },
    onError: () =>
      toast.error(
        "Failed to import. Add your Twilio credentials in Settings first."
      ),
  });

  const makeCall = useMutation({
    mutationFn: () =>
      api.post("/v1/calls/outbound", {
        agent_id: agentId,
        to_number: toNumber.trim(),
      }),
    onSuccess: () => {
      toast.success(`Call initiated to ${toNumber}`);
      qc.invalidateQueries({ queryKey: ["calls"] });
      setToNumber("");
      setAgentId("");
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to start call"),
  });

  const fromNumber = agentId
    ? (phoneNumbers as any[])?.find((n: any) => n.agent_id === agentId)
    : null;
  const hasNoNumbers = !(phoneNumbers as any[])?.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div
              className="bg-surface rounded-2xl shadow-modal border border-border w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <h2 className="text-section-title text-text-primary tracking-tight">
                  Make a Call
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-button text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {hasNoNumbers ? (
                  <>
                    <p className="text-body text-text-secondary">
                      Import your own number first to make and receive calls.
                      Add Twilio credentials in Settings, then import your numbers.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => importNumbers.mutate()}
                        disabled={importNumbers.isPending}
                      >
                        {importNumbers.isPending ? "Importing…" : "Import from Twilio"}
                      </Button>
                      <Link href="/phone-numbers" onClick={onClose}>
                        <Button variant="secondary" className="w-full">
                          Go to Phone Numbers
                        </Button>
                      </Link>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-label text-text-secondary mb-1.5">
                        Agent
                      </label>
                      <select
                        value={agentId}
                        onChange={(e) => setAgentId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-border rounded-input text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      >
                        <option value="">Select an agent...</option>
                        {agents?.map((agent: any) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {agentId && (
                      <div className="rounded-card bg-background/50 border border-border px-3 py-2.5">
                        {fromNumber ? (
                          <p className="text-label text-text-secondary">
                            Calling from{" "}
                            <span className="font-mono font-medium text-text-primary">
                              {fromNumber.number}
                            </span>
                          </p>
                        ) : (
                          <p className="text-label text-amber-600 dark:text-amber-400">
                            This agent has no number assigned. Assign one in{" "}
                            <Link href="/phone-numbers" className="underline font-medium">
                              Phone Numbers
                            </Link>
                            .
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-label text-text-secondary mb-1.5">
                        Phone number to call
                      </label>
                      <input
                        value={toNumber}
                        onChange={(e) => setToNumber(e.target.value)}
                        placeholder="+12025551234"
                        className="w-full px-3 py-2.5 border border-border rounded-input text-body font-mono bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                      />
                      <p className="text-label text-text-muted mt-1">
                        Include country code. Example: +12025551234
                      </p>
                    </div>

                    <div className="px-6 py-4 -mx-6 -mb-5 border-t border-border flex gap-3 mt-4">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => {
                          if (!fromNumber) {
                            toast.error(
                              "Assign a number to this agent in Phone Numbers first."
                            );
                            return;
                          }
                          makeCall.mutate();
                        }}
                        disabled={
                          !toNumber.trim() ||
                          !agentId ||
                          !fromNumber ||
                          makeCall.isPending
                        }
                      >
                        <Phone size={14} className="mr-1.5" />
                        {makeCall.isPending ? "Calling..." : "Start Call"}
                      </Button>
                      <Button variant="secondary" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
