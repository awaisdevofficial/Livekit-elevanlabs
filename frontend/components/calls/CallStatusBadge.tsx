"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";

export function CallStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} size="sm" />;
}
