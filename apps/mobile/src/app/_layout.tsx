import '../../global.css';

import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { ConvexReactClient } from 'convex/react';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as TaskManager from 'expo-task-manager';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VehicleControlSessionProvider } from '@/contexts/vehicle-control-session-context';
import { cn, Env, loadSelectedTheme, NotificationProvider } from '@/lib';
import { authClient } from '@/lib/auth/auth-client';
import { useThemeConfig } from '@/lib/use-theme-config';
export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

loadSelectedTheme();
const BACKGROUND_NOTIFICATION_TASK =
  Env.BACKGROUND_NOTIFICATION_TASK || 'notification-task';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log('✅ Received a notification in the background!', {
      data,
      error,
      executionInfo,
    });
    return Promise.resolve();
  },
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const convex = new ConvexReactClient(Env.EXPO_PUBLIC_CONVEX_URL as string, {
  expectAuth: true,
  verbose: true,
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(app)">
        <Stack.Screen name="(app)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="[...messing]" />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={cn('font-sf', theme.dark ? `dark` : undefined)}
    >
      <SafeAreaProvider>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          <NotificationProvider>
            <KeyboardProvider>
              <ThemeProvider value={theme}>
                <BottomSheetModalProvider>
                  <VehicleControlSessionProvider>
                    {children}
                    <FlashMessage position="top" style={{ marginTop: 50 }} />
                  </VehicleControlSessionProvider>
                </BottomSheetModalProvider>
              </ThemeProvider>
            </KeyboardProvider>
          </NotificationProvider>
        </ConvexBetterAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
