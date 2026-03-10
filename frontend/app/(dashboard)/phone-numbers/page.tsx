"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Phone,
  RefreshCw,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { cn } from "@/components/lib-utils";

type TelephonyStatus = {
  is_connected: boolean;
  phone_number: string | null;
};

type PhoneNumberRow = {
  id: string;
  number: string;
  friendly_name?: string;
  agent_id?: string;
  use_for?: string;
};

const USE_FOR_OPTIONS = [
  { value: "both", label: "Inbound & Outbound" },
  { value: "inbound", label: "Inbound only" },
  { value: "outbound", label: "Outbound only" },
];

export default function PhoneNumbersPage() {
  const qc = useQueryClient();
  const [importing, setImporting] = useState(false);

  const { data: status } = useQuery<TelephonyStatus>({
    queryKey: ["telephony-status"],
    queryFn: () => api.get("/v1/telephony/status"),
  });

  const { data: numbers = [], isLoading } = useQuery<PhoneNumberRow[]>({
    queryKey: ["phone-numbers"],
    queryFn: () => api.get("/v1/phone-numbers"),
    enabled: !!status?.is_connected,
  });

  const { data: agents = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["agents"],
    queryFn: () => api.get("/v1/agents"),
    enabled: !!status?.is_connected,
  });

  const importNumbers = useMutation({
    mutationFn: () => api.post("/v1/phone-numbers/import", {}),
    onMutate: () => setImporting(true),
    onSuccess: (data: { imported?: number }) => {
      toast.success(
        `Imported ${data?.imported ?? 0} number(s). Assign agents in Agent settings.`
      );
      qc.invalidateQueries({ queryKey: ["phone-numbers"] });
    },
    onError: () => {
      toast.error("Failed to import. Connect your phone in Settings first.");
    },
    onSettled: () => setImporting(false),
  });

  const assignNumber = useMutation({
    mutationFn: ({
      numberId,
      agentId,
      useFor,
    }: {
      numberId: string;
      agentId: string | null;
      useFor: string;
    }) =>
      api.patch(`/v1/phone-numbers/${numberId}`, {
        agent_id: agentId || undefined,
        use_for: useFor,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["phone-numbers"] });
    },
    onError: () => toast.error("Failed to update number"),
  });

  if (!status?.is_connected) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Phone Numbers"
          subtitle="Import and manage numbers for your agents"
        />
        <div className="glass-card p-8 max-w-lg border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-500/20 p-3">
              <Phone className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-1">
                Connect your phone account
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Connect your Twilio account and phone number in Settings →
                Integrations (one place for all calling). Then return here to
                import numbers and assign them to agents.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4DFFCE]/20 text-[#4DFFCE] font-medium text-sm hover:bg-[#4DFFCE]/30 transition-colors"
              >
                <Settings size={16} />
                Open Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Phone Numbers"
        subtitle="Import numbers from Twilio and assign them to agents (inbound, outbound, or both)"
        actions={
          <button
            type="button"
            onClick={() => importNumbers.mutate()}
            disabled={importNumbers.isPending || importing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            )}
          >
            {importNumbers.isPending || importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Import from Twilio
          </button>
        }
      />

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#4DFFCE]" size={28} />
          </div>
        ) : numbers.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <Phone className="mx-auto text-white/40 mb-3" size={40} />
            <p className="text-sm text-white/70 mb-4">
              No numbers yet. Click &quot;Import from Twilio&quot; to sync your
              Twilio numbers.
            </p>
            <button
              type="button"
              onClick={() => importNumbers.mutate()}
              disabled={importNumbers.isPending || importing}
              className="btn-primary disabled:opacity-50"
            >
              {importNumbers.isPending || importing ? (
                <Loader2 size={16} className="animate-spin inline mr-2" />
              ) : null}
              Import from Twilio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="text-left py-3 px-4 font-medium text-white/70">
                    Number
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-white/70">
                    Agent
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-white/70">
                    Use for
                  </th>
                </tr>
              </thead>
              <tbody>
                {numbers.map((row) => {
                  const agent = agents.find((a) => a.id === row.agent_id);
                  const useFor = row.use_for || "both";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-white">
                          {row.number}
                        </span>
                        {row.friendly_name && (
                          <span className="ml-2 text-white/60 text-xs">
                            {row.friendly_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={row.agent_id ?? ""}
                          onChange={(e) => {
                            const id = e.target.value || null;
                            assignNumber.mutate({
                              numberId: row.id,
                              agentId: id,
                              useFor,
                            });
                          }}
                          className="w-full max-w-[200px] px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DFFCE]/50 focus:border-[#4DFFCE]/50"
                        >
                          <option value="">No agent</option>
                          {agents.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={useFor}
                          onChange={(e) => {
                            const v = e.target.value;
                            assignNumber.mutate({
                              numberId: row.id,
                              agentId: row.agent_id ?? null,
                              useFor: v,
                            });
                          }}
                          className="w-full max-w-[180px] px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DFFCE]/50 focus:border-[#4DFFCE]/50"
                        >
                          {USE_FOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <span className="ml-2 inline-flex items-center gap-1 text-white/50" title={useFor}>
                          {useFor === "inbound" && (
                            <ArrowDownLeft size={12} />
                          )}
                          {useFor === "outbound" && (
                            <ArrowUpRight size={12} />
                          )}
                          {useFor === "both" && (
                            <>
                              <ArrowDownLeft size={12} />
                              <ArrowUpRight size={12} />
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-white/50">
        You can also assign a number and set Inbound/Outbound/Both when editing
        an agent (Agent → Edit → Phone number).
      </p>
    </div>
  );
}
