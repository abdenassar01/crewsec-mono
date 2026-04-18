import { api } from 'convex/_generated/api';
import { Redirect } from 'expo-router';
import React from 'react';

import { RootWrapper } from '@/components/common';
import { EmployeeScreen, HomeScreen } from '@/components/core';
import {
  ActivityIndicator,
  FocusAwareStatusBar,
  ScrollView,
} from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';

export default function Home() {
  const user = useSafeQuery(api.users.getCurrentUserProfile);

  if (user === undefined) return <ActivityIndicator size={24} />;
  if (user?.role === 'ADMIN') return <Redirect href="/admin" />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <RootWrapper>
        <FocusAwareStatusBar />
        {user && user.role === 'EMPLOYEE' ? <EmployeeScreen /> : <HomeScreen />}
      </RootWrapper>
    </ScrollView>
  );
}
