import { Stack } from 'expo-router';
import React from 'react';

export default function ControlFeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
