import React, { type ReactNode } from 'react';
import { Platform } from 'react-native';

import { View } from '@/components/ui';
import { cn } from '@/lib/helpers';

export function RootWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      style={{ paddingHorizontal: Platform.OS === 'web' ? 8 : 0 }}
      className={cn('pt-16 flex-1', className)}
    >
      {children}
      <View className="h-6" />
    </View>
  );
}
