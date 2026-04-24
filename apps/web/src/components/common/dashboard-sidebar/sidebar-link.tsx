"use client"

import { cn } from "@/lib";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function SidebarLink({ href, label, icon }: { href: string; label: string; icon: any }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href as any}
      className={cn(
        "flex items-center my-1 gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="h-5 w-5" />
      {label}
    </Link>
  );
}