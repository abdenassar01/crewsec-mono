"use client";

import { ThemeProvider } from "../theme-provider";
import { Toaster } from "../ui/sonner";
import AuthLayoutProvider from "./auth-layout-provider";
import { ConvexClientProvider } from "./convex-client-provider";

export function Providers({ children }: { children: React.ReactNode }) {



  return (
    <ConvexClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthLayoutProvider>
          {children}
        </AuthLayoutProvider>

        <Toaster />
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
