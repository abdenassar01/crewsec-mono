import React, { type ReactNode } from 'react';
import { Platform } from 'react-native';

import { FocusAwareStatusBar, View } from '@/components/ui';
import { cn } from '@/lib/helpers';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ScreenWrapper({ children, className }: Props) {
  return (
    <View
      className={cn(
        'container',
        Platform.OS === 'ios' ? 'pt-12' : '',
        className,
      )}
    >
      <FocusAwareStatusBar />
      {children}
    </View>
  );
}
