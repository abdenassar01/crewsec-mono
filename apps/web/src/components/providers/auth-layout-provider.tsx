"use client";

import { useConvexAuth, useQuery } from 'convex/react';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client';
import { api } from '@convex/_generated/api';

export default function AuthLayoutProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: convexAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const user = useQuery(api.users.getCurrentUserProfile);

  // Check better-auth session first
  const session = authClient.useSession();
  const hasBetterAuthSession = session.data?.user !== null && session.data?.user !== undefined;
  const isBetterAuthLoading = session.isPending;

  // Use better-auth session as primary auth check, fall back to Convex
  const isAuthenticated = hasBetterAuthSession || convexAuthenticated;
  const isLoading = convexLoading || isBetterAuthLoading;

  useEffect(() => {
    if (isLoading) return;

    // Redirect authenticated users away from login page
    // CLIENT users go to /client, others go to /dashboard
    if (isAuthenticated && pathname === '/login') {
      // Wait for user data to be available
      if (user === undefined) return;


      router.replace('/');

      return;
    }

    // Only redirect to login if we're sure user is not authenticated
    // Give better-auth session priority over Convex auth
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router, user]);

  // On login page, show content immediately
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">loading...</div>;
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show nothing for unauthenticated users
  return null;
}
