"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/lib-utils";

interface Props {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
  collapsed?: boolean;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  external,
  collapsed,
}: Props) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60",
          "hover:bg-white/5 hover:text-white transition-all duration-200",
          collapsed && "justify-center"
        )}
      >
        <Icon size={18} />
        {!collapsed && <span>{label}</span>}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white/10 text-white shadow-[inset_2px_0_0_#4DFFCE]"
          : "text-white/60 hover:bg-white/5 hover:text-white",
        collapsed && "justify-center"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon
        size={18}
        className={cn(isActive ? "text-[#4DFFCE]" : "")}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
