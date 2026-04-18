import React from 'react';
import { useColorScheme, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

import { Text } from '@/components/ui';

interface LocationButtonProps {
  onPress: () => void;
}

export function LocationButton({ onPress }: LocationButtonProps) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="my-2 w-full flex-row items-center justify-center gap-2 rounded-xl bg-secondary p-3 dark:bg-primary"
    >
      <Image
        className="aspect-square w-7"
        source={
          colorScheme === 'dark'
            ? require('assets/icons/dark/location.png')
            : require('assets/icons/light/location.png')
        }
      />
      <Text className="text-textdark dark:text-text">
        {t('home.location')}
      </Text>
    </TouchableOpacity>
  );
}
