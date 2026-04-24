'use client'

import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import React from "react"

export default function Layout({
  children,
  client,
  dashboard,
}: {
  children: React.ReactNode
  client: React.ReactNode
  dashboard: React.ReactNode
}) {

  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUserProfile);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthLoading, isAuthenticated]);

  if (isAuthLoading || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <>
      {user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "EMPLOYEE" ? dashboard : user.role === "CLIENT" ? client : children}
    </>
  )
}