import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { VehicleControlOffline } from '@/components/core';

export default function VehicleControl() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();

  return <VehicleControlOffline initialReference={reference} />;
}
