import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { requestBluetoothPermissions } from '@/lib';

export default function AdminLayout() {
  useEffect(() => {
    requestBluetoothPermissions().then(() => {});
  }, []);
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="manage-users" />
      <Stack.Screen name="control-fee" />
      <Stack.Screen name="control" />
      <Stack.Screen name="manage-felparkerings" />
      <Stack.Screen name="manage-makulera" />
      <Stack.Screen name="add-user" />
      <Stack.Screen name="parking-infos" />
    </Stack>
  );
}
