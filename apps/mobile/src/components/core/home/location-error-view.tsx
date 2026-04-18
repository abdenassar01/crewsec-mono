import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { ActivityIndicator, Text } from '@/components/ui';

interface LocationErrorViewProps {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

export function LocationErrorView({
  error,
  isLoading,
  onRetry,
}: LocationErrorViewProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={50} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-textdark dark:text-text">
          {error}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 rounded-lg bg-primary px-4 py-2 dark:bg-secondary"
        >
          <Text className="text-text dark:text-gray-100">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
