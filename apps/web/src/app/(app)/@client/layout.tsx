"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import Image from "next/image";

import { LogoutButton } from "@/components/core";
import { api } from "@convex/_generated/api";
import { useQuery, useConvexAuth } from "convex/react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.getCurrentUserProfile);

  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-background border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex  items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 ">
              <Image
                src="/logo.png"
                className="h-8 w-auto"
                alt="Crewsec Logo"
                width={120}
                height={32}
              />
            </Link>
            <span className="text-muted-foreground text-2xl">{user?.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
