import { Stack } from 'expo-router';
import React from 'react';

export default function FelparkeringLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
