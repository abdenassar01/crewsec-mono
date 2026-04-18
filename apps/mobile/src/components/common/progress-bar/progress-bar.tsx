import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '@/lib/helpers';

type Props = {
  steps?: number;
  currentStep?: number;
  header?: string;
  className?: string;
};

export function ProgressBar({
  steps = 3,
  currentStep = 0,
  header,
  className,
}: Props) {
  const width = useSharedValue('0%');

  const style = useAnimatedStyle<any>(() => {
    return {
      width: withSpring(width.value, {}),
    };
  }, []);

  useEffect(() => {
    width.value = `${(currentStep / steps) * 100}%`;
  }, [currentStep, steps, width]);

  return (
    <View className={cn('my-1', className)}>
      {header && <Text className="font-bold text-secondary ">{header}</Text>}
      <View className="relative h-2 w-full rounded-full bg-background-secondary dark:bg-background-secondary-dark">
        <Animated.View
          style={style}
          className={cn('absolute top-0 left-0 rounded-full h-2 bg-secondary')}
        />
      </View>
    </View>
  );
}
