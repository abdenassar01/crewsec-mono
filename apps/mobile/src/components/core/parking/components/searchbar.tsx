import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Input, View } from '@/components/ui';

interface Props {
  setValue: React.Dispatch<React.SetStateAction<string>>;
  value: string;
}

export function Searchbar({ setValue, value }: Props) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center rounded-full bg-white pl-4 dark:bg-background-secondary-dark">
      <Image
        className="aspect-square w-7"
        source={
          colorScheme === 'dark'
            ? require('assets/icons/dark/search.png')
            : require('assets/icons/light/search.png')
        }
      />
      <View className="mx-2 h-8 w-0.5 rounded-full bg-secondary" />
      <Input
        placeholder={t('manage-parking.reference')}
        wrapperClassName="w-[85%] mb-0"
        className="pl-1"
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
}
