import { useColorScheme } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { api } from 'convex/_generated/api';
import { ActivityIndicator, colors, Image, Text, View } from '@/components/ui';
import { cn } from '@/lib/helpers';

export function ParkingStatics() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const parkingData = useSafeQuery(api.parkings.getUserParking, {});

  const data = parkingData
    ? {
        data: {
          id: parkingData._id,
          ...parkingData,
        },
        success: true,
      }
    : null;

  const isLoading = parkingData === undefined;
  const error =
    parkingData === null ? new Error('User parking not found') : null;

  if (isLoading)
    return <ActivityIndicator color={colors.secondary} size={50} />;
  if (error) return <Text className="text-danger-600">{error.message}</Text>;

  return (
    <View className="w-full items-center justify-center gap-2 rounded-3xl bg-background-secondary p-3 dark:bg-background-secondary-dark">
      <Text className="my-2 text-xl font-bold text-secondary dark:text-yellow-400">
        {t('parking.Information')}
      </Text>
      <View className="h-0.5 w-full rounded-full bg-background-secondary dark:bg-background-secondary-dark" />
      <Text className="text-center text-xs text-text dark:text-gray-100">
        {data?.data?.description}
      </Text>
      <View className={cn('flex-row w-full border-gray-200 pt-2')}>
        <Image
          className="mr-1 aspect-square size-5"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/web.png')
              : require('assets/icons/light/web.png')
          }
        />
        <Text className="text-xs text-text dark:text-gray-100">
          {data?.data?.website}
        </Text>
      </View>
      <View className={cn('flex-row items-center w-full border-gray-200')}>
        <Image
          className="mr-1 aspect-square size-5"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/security.png')
              : require('assets/icons/light/security.png')
          }
        />
        <Text className="text-xs text-text dark:text-gray-100">
          {data?.data?.name}
        </Text>
      </View>
    </View>
  );
}
