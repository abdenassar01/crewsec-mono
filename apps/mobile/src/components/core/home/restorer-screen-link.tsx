import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity } from '@/components/ui';

export function RestorerScreenLink() {
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => push('/restorer-new-vehicle')}
      className="mb-2 flex-row items-center gap-2 rounded-3xl bg-white p-3 dark:bg-background-secondary-dark"
    >
      <Image
        className="size-28"
        source={
          colorScheme === 'dark'
            ? require('assets/icons/dark/new-car.png')
            : require('assets/icons/light/new-car.png')
        }
      />
      <Text className="text-xl font-bold text-secondary dark:text-yellow-400">
        {t('home.restorer')}
      </Text>
    </TouchableOpacity>
  );
}
