import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';

import { TouchableOpacity, View } from '@/components/ui';
import { primary } from '@/components/ui/colors';
import { useSelectedTheme } from '@/lib';
import { cn } from '@/lib/helpers';

export function ThemeSelector() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();

  return (
    <View className="border-secondary/10 dark:border-primary flex-row rounded-full border p-px">
      <TouchableOpacity
        onPress={() => setSelectedTheme('light')}
        className={cn(
          'rounded-full p-1.5',
          selectedTheme === 'light' ? 'dark:bg-primary bg-secondary' : '',
        )}
      >
        <Ionicons name="sunny-outline" size={16} color={primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setSelectedTheme('system')}
        className={cn(
          'rounded-full p-1.5',
          selectedTheme === 'system' ? 'dark:bg-primary bg-secondary' : '',
        )}
      >
        <Ionicons name="laptop-outline" size={16} color={primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setSelectedTheme('dark')}
        className={cn(
          'rounded-full p-1.5',
          selectedTheme === 'dark' ? 'dark:bg-primary bg-secondary ' : '',
        )}
      >
        <Ionicons name="moon-outline" size={16} color={primary} />
      </TouchableOpacity>
    </View>
  );
}
