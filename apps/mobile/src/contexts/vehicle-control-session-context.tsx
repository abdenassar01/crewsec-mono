/* eslint-disable max-lines-per-function */
import React, { createContext, useContext, useEffect, useState } from 'react';

import { getUser } from '@/lib/storage/user-storage';
import {
  sessionStorage,
  type VehicleControlSession,
} from '@/services/vehicle-control-storage';

interface VehicleControlSessionContextType {
  session: VehicleControlSession | null;
  sessionStartTime: number | null;
  startSession: () => void;
  updateSession: (updates: Partial<VehicleControlSession>) => void;
  endSession: () => void;
  isSessionActive: boolean;
}

const VehicleControlSessionContext = createContext<
  VehicleControlSessionContextType | undefined
>(undefined);

export function VehicleControlSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<VehicleControlSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const user = getUser();

  // Load session on mount
  useEffect(() => {
    if (user?.userId) {
      const loadedSession = sessionStorage.loadSession(user.userId);
      if (loadedSession) {
        setSession(loadedSession);
        setSessionStartTime(loadedSession.startTime);
      }
    }
  }, [user?.userId]);

  const startSession = () => {
    if (!user?.userId) return;

    const newSession: VehicleControlSession = {
      startTime: Date.now(),
      currentLocationId: null,
      currentTownId: null,
      selectedReferences: [],
      lastActiveTime: Date.now(),
      userId: user.userId,
    };
    sessionStorage.saveSession(newSession);
    setSession(newSession);
    setSessionStartTime(Date.now());
  };

  const updateSession = (updates: Partial<VehicleControlSession>) => {
    if (!session || !user?.userId) return;

    const updatedSession = {
      ...session,
      ...updates,
      lastActiveTime: Date.now(),
    };
    sessionStorage.saveSession(updatedSession);
    setSession(updatedSession);
  };

  const endSession = () => {
    if (!user?.userId) return;
    sessionStorage.clearSession(user.userId);
    setSession(null);
    setSessionStartTime(null);
  };

  const isSessionActive = session !== null;

  return (
    <VehicleControlSessionContext.Provider
      value={{
        session,
        sessionStartTime,
        startSession,
        updateSession,
        endSession,
        isSessionActive,
      }}
    >
      {children}
    </VehicleControlSessionContext.Provider>
  );
}

export function useVehicleControlSession() {
  const context = useContext(VehicleControlSessionContext);
  if (context === undefined) {
    throw new Error(
      'useVehicleControlSession must be used within a VehicleControlSessionProvider',
    );
  }
  return context;
}
