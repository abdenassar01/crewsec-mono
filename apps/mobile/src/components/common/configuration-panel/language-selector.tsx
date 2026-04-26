import React from 'react';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { useSelectedLanguage } from '@/lib';
import { cn } from '@/lib/helpers';

export function LanguageSelector() {
  const { language, setLanguage } = useSelectedLanguage();

  return (
    <View className="flex-row rounded-full border border-secondary/10 p-0.5">
      <TouchableOpacity
        onPress={() => setLanguage('en')}
        className={cn(
          'rounded-full w-7 aspect-square flex justify-center items-center p-1',
          language === 'en' ? 'bg-secondary/10' : '',
        )}
      >
        <Text
          className={cn(
            'dark:text-text text-[10px] text-secondary!',
          )}
        >
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLanguage('sw')}
        className={cn(
          'rounded-full w-7 aspect-square flex justify-center items-center p-1',
          language === 'sw' ? 'bg-secondary/10' : '',
        )}
      >
        <Text
          className={cn(
            'dark:text-text text-[10px] text-secondary!',
          )}
        >
          SW
        </Text>
      </TouchableOpacity>
    </View>
  );
}
