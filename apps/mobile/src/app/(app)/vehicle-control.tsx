import { useLocalSearchParams, Redirect } from 'expo-router';
import React from 'react';

import { VehicleControlOffline } from '@/components/core';
import { useUser } from '@/hooks';

export default function VehicleControl() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const { user } = useUser();

  const isAdmin =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EMPLOYEE';

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  return <VehicleControlOffline initialReference={reference} />;
}
