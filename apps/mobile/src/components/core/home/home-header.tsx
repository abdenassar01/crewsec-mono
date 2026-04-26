import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React from 'react';

import { Text, View } from '@/components/ui';

interface Props {
  name: string;
  organizationLogo?: string;
}

export function HomeHeader({ name, organizationLogo }: Props) {
  const colorScheme = useColorScheme();

  return (
    <View className="container flex-row items-end justify-between pt-4">
      <View className="justify-center">
        <Text className="text-xl font-bold text-secondary dark:text-yellow-400">
          {name}
        </Text>
      </View>

      <Image
        className="h-[40px] w-[150px]"
        source={
          organizationLogo
            ? {uri: organizationLogo}
            : colorScheme === 'dark'
            ? require('assets/icons/dark/logo.png')
            : require('assets/icons/light/logo.png')
        }
      />
    </View>
  );
}
