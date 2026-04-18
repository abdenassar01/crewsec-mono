import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Pressable, Text, View } from 'react-native';

interface TownCardProps {
  town: { _id: string; label: string };
  locationName: string;
  referenceCount: number;
  onPress: () => void;
}

export function TownCard({
  town,
  locationName,
  referenceCount,
  onPress,
}: TownCardProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-2 rounded-xl border border-secondary/10 bg-background-secondary p-3 dark:bg-background-secondary-dark"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-foreground dark:text-foreground-dark text-sm font-semibold">
            {town.label}
          </Text>
          <Text className="text-muted-foreground dark:text-muted-foreground-dark text-xs">
            {locationName} • {referenceCount} reference
            {referenceCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {referenceCount > 0 && (
            <View className="rounded-full bg-secondary/20 px-2 py-0.5">
              <Text className="text-xs font-semibold text-secondary">
                {referenceCount}
              </Text>
            </View>
          )}
          <Ionicons
            name="add-circle"
            size={20}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
            className="opacity-70"
          />
        </View>
      </View>
    </Pressable>
  );
}
