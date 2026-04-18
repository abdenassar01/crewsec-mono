import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { secondary } from '@/components/ui/colors';
import { cn } from '@/lib/helpers';

type Props = {
  title: string;
  className?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

export function Header({ title, className, onBack, rightAction }: Props) {
  const { back: routerBack } = useRouter();
  const handleBack = onBack || routerBack;

  return (
    <View
      className={cn(
        'w-full flex-row gap-2 items-center bg-background-secondary dark:bg-background-secondary-dark p-3 rounded-2xl',
        className,
      )}
    >
      <TouchableOpacity hitSlop={10} onPress={handleBack}>
        <Ionicons name="chevron-back-outline" size={20} color={secondary} />
      </TouchableOpacity>
      <Text className="text-black font-bold dark:text-white">{title}</Text>
      {rightAction && <View className="ml-auto">{rightAction}</View>}
    </View>
  );
}
