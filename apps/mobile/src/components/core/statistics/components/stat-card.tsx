import { useColorScheme, Image } from 'react-native';
import React from 'react';

import { Text, View } from '@/components/ui';

interface StatCardProps {
  value: number | string;
  label: string;
  subtitle?: string;
  color?: string;
}

export function StatCard({
  value,
  label,
  subtitle,
  color,
}: StatCardProps) {
  return (
    <View className="rounded-xl w-[48%] bg-white p-4 dark:bg-background-secondary-dark">
      <Text
        className="text-2xl font-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
