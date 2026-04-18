import React from 'react';
import { Linking, useColorScheme } from 'react-native';

import { Image, Text, View } from '@/components/ui';
import { CARD_CLASS } from './shared';

interface ParkingHeaderCardProps {
  imageUrl?: string;
  name: string;
  description?: string;
  address?: string;
  website?: string;
}

export function ParkingHeaderCard({
  imageUrl,
  name,
  description,
  address,
  website,
}: ParkingHeaderCardProps) {
  const colorScheme = useColorScheme();

  return (
    <>
      {imageUrl ? (
        <Image
          className="mb-3 h-60 w-full rounded-2xl"
          source={{ uri: imageUrl }}
        />
      ) : null}

      <View className={CARD_CLASS}>
        <View className="mb-2 flex-row items-center gap-2">
          <Image
            className="size-5"
            source={
              colorScheme === 'dark'
                ? require('assets/icons/dark/security.png')
                : require('assets/icons/light/security.png')
            }
          />
          <Text className="text-lg font-bold text-secondary dark:text-yellow-400">
            {name}
          </Text>
        </View>
        {description ? (
          <Text className="text-xs text-text dark:text-gray-100">
            {description}
          </Text>
        ) : null}
        {address ? (
          <Text className="mt-1 text-xs text-text dark:text-gray-300">
            {address}
          </Text>
        ) : null}
        {website ? (
          <Text
            className="mt-1 text-xs text-blue-500"
            onPress={() => {
              const url = website.startsWith('http') ? website : `https://${website}`;
              Linking.openURL(url);
            }}
          >
            {website}
          </Text>
        ) : null}
      </View>
    </>
  );
}
