import React from 'react';
import { ActivityIndicator } from 'react-native';

import { RootWrapper } from '@/components/common';
import { secondary } from '@/components/ui/colors';
import { Text } from '@/components/ui';
import { useConvexAuth } from 'convex/react';
import { Redirect } from 'expo-router';

export default function Loading() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  console.log(
    'Loading screen - isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading,
  );

  if (isLoading) {
    return (
      <RootWrapper className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold">Authenticating...</Text>
        <ActivityIndicator size={70} color={secondary} />
      </RootWrapper>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/" />;
  }

  return (
    <RootWrapper className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Authenticating...</Text>
      <ActivityIndicator size={70} color={secondary} />
    </RootWrapper>
  );
}
