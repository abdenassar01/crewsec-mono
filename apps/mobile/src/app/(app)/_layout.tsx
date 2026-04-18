/* eslint-disable max-lines-per-function */
import { useConvexAuth } from 'convex/react';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { ActivityIndicator, View } from '@/components/ui';
import { useIsFirstTime } from '@/lib';

export default function MainLayout() {
  const [isFirstTime] = useIsFirstTime();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    setTimeout(hideSplash, 1000);
  }, [hideSplash]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={52} />
      </View>
    );
  }

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="vehicle-control" />
      <Stack.Screen name="report/index" />
      <Stack.Screen name="restorer-new-vehicle" />
      <Stack.Screen name="report/[id]" />
      <Stack.Screen name="felparkering/index" />
      <Stack.Screen name="manage-parking" />
      <Stack.Screen name="reports-list" />
      <Stack.Screen name="makulera/index" />
      <Stack.Screen name="parking" />
    </Stack>
  );
}
