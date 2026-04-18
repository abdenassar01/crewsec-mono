import { api } from 'convex/_generated/api';
import { useCallback, useEffect, useState } from 'react';

import {
  getLoading,
  getUser,
  initializeLoadingState,
  setLoading,
  setUser,
  type User,
} from '@/lib/storage/user-storage';

import { useSafeQuery } from './use-convex-hooks';

export const useUser = () => {
  useEffect(() => {
    initializeLoadingState();
  }, []);

  const [user, setUserState] = useState<User | null>(getUser());
  const [isLoading, setIsLoadingState] = useState(getLoading());
  const [isHydrated, setIsHydrated] = useState(false);

  const data = useSafeQuery(api.users.getCurrentUserProfile);

  useEffect(() => {
    const currentLoading = getLoading();
    setIsLoadingState(currentLoading);

    if (!data) {
      setLoading(true);
      setIsLoadingState(true);
    } else {
      setUser(data);
      setUserState(data);
      setLoading(false);
      setIsLoadingState(false);
    }
  }, [data]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoading(false);
        setIsLoadingState(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Mark as hydrated once we have attempted to load user data
  useEffect(() => {
    if (data !== undefined || !isLoading) {
      setIsHydrated(true);
    }
  }, [data, isLoading]);

  const hydrateAuth = useCallback(() => {
    // Force re-hydration by clearing cached user and triggering refetch
    setUser(null);
    setUserState(null);
    setLoading(true);
    setIsLoadingState(true);
    setIsHydrated(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isHydrated,
    hydrateAuth,
  };
};

export const useUpdateUser = () => {
  return {
    updateUser: (user: User | null) => {
      setUser(user);
    },
  };
};
