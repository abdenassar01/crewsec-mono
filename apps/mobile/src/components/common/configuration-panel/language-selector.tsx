import React from 'react';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { useSelectedLanguage } from '@/lib';
import { cn } from '@/lib/helpers';

export function LanguageSelector() {
  const { language, setLanguage } = useSelectedLanguage();

  return (
    <View className="flex-row rounded-full border border-secondary p-px dark:border-primary">
      <TouchableOpacity
        onPress={() => setLanguage('en')}
        className={cn(
          'rounded-full w-[30px] aspect-square flex justify-center items-center',
          language === 'en' ? 'dark:bg-primary bg-secondary' : '',
        )}
      >
        <Text
          className={cn(
            'dark:text-text text-[10px]',
            language !== 'en'
              ? 'text-text dark:text-gray-100'
              : 'text-textdark',
          )}
        >
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLanguage('sw')}
        className={cn(
          'rounded-full w-[30px] aspect-square flex justify-center items-center',
          language === 'sw' ? 'dark:bg-primary bg-secondary' : '',
        )}
      >
        <Text
          className={cn(
            'dark:text-text text-[10px]',
            language !== 'sw'
              ? 'text-text dark:text-gray-100'
              : 'text-textdark',
          )}
        >
          SW
        </Text>
      </TouchableOpacity>
    </View>
  );
}
