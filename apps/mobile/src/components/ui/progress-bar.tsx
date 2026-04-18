import React, { forwardRef, type ReactNode, useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { cn } from '@/lib/helpers';

type Props = {
  initialProgress?: number;
  className?: string;
  indicator?: ReactNode;
};

export type ProgressBarRef = {
  setProgress: (value: number) => void;
};

export const ProgressBar = forwardRef<ProgressBarRef, Props>(
  ({ initialProgress = 0, className = '', indicator }, ref) => {
    const progress = useSharedValue<number>(initialProgress ?? 0);
    useImperativeHandle(ref, () => {
      return {
        setProgress: (value: number) => {
          progress.value = withTiming(value, {
            duration: 250,
            easing: Easing.inOut(Easing.quad),
          });
        },
      };
    }, [progress]);

    const style = useAnimatedStyle(() => {
      return {
        width: `${progress.value}%`,
        height: 8,
      };
    });

    const indicatorStyle = useAnimatedStyle(() => {
      return {
        left: `${progress.value - 5}%`,
      };
    });

    return (
      <View className={cn(indicator ? 'pt-10' : '')}>
        <View
          className={twMerge(
            `rounded-full bg-gray-200 dark:bg-gray-700`,
            className,
          )}
        >
          <Animated.View className="absolute -top-6" style={indicatorStyle}>
            {indicator}
          </Animated.View>
          <Animated.View className="rounded-full bg-primary" style={style} />
        </View>
      </View>
    );
  },
);
