import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib';
import { Doc } from 'convex/_generated/dataModel';

interface LocationCardProps {
  location: Doc<'locations'>;
  onPress: () => void;
  isActive: boolean;
}

export function LocationCard({
  location,
  onPress,
  isActive,
}: LocationCardProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mb-2 rounded-xl border border-secondary/10 bg-background-secondary p-3 dark:bg-background-secondary-dark',
        isActive ? 'border-secondary bg-secondary/10 dark:bg-secondary/20' : '',
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-foreground dark:text-foreground-dark text-sm font-semibold">
            {location.label}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
          className="opacity-50"
        />
      </View>
    </Pressable>
  );
}
