import { api } from 'convex/_generated/api';
import * as Application from 'expo-application';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSafeMutation } from '@/hooks/use-convex-hooks';
import { useNotification } from '@/lib';

async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    return await Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    return (await Application.getIosIdForVendorAsync()) || '';
  }
  // Fallback for web or other platforms
  return crypto.randomUUID();
}

export function UpdateNotificationToken() {
  const { expoPushToken } = useNotification();
  const mutate = useSafeMutation(api.notifications.recordPushNotificationToken);

  useEffect(() => {
    if (expoPushToken) {
      getDeviceId().then((deviceId) => {
        mutate({
          token: expoPushToken,
          deviceId,
        });
      });
    }
  }, [expoPushToken, mutate]);

  return <></>;
}
