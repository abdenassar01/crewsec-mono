import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';

import { TouchableOpacity, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { useSelectedTheme } from '@/lib';
import { cn } from '@/lib/helpers';

export function ThemeSelector() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();

  return (
    <View className="border-secondary/10 flex-row rounded-full border p-px">
      <TouchableOpacity
        onPress={() => setSelectedTheme('light')}
        className={cn(
          'rounded-full p-2',
          selectedTheme === 'light' ? 'bg-secondary/10' : '',
        )}
      >
        <Ionicons name="sunny-outline" size={15} color={colors.secondary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setSelectedTheme('system')}
        className={cn(
          'rounded-full p-2',
          selectedTheme === 'system' ? 'bg-secondary/10' : '',
        )}
      >
        <Ionicons name="laptop-outline" size={15} color={colors.secondary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setSelectedTheme('dark')}
        className={cn(
          'rounded-full p-2',
          selectedTheme === 'dark' ? 'bg-secondary/10' : '',
        )}
      >
        <Ionicons name="moon-outline" size={15} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}
