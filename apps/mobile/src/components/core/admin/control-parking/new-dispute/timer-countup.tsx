/* eslint-disable max-lines-per-function */
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { type AnyControl } from '@/components/ui';
import { cn, formatTimeSeconds } from '@/lib';

interface TimerCountUpProps {
  control: AnyControl;
  startDateName: string;
  endDateName: string;
  autoStart?: boolean;
  initialTime?: number;
}

export function TimerCountUp({
  control,
  startDateName,
  endDateName,
  autoStart = false,
  initialTime = 0,
}: TimerCountUpProps) {
  const [elapsedTime, setElapsedTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { field: startDateField } = useController({
    name: startDateName,
    control,
    defaultValue: null,
  });

  const { field: endDateField } = useController({
    name: endDateName,
    control,
    defaultValue: null,
  });

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '--:--:--';
    return format(new Date(timestamp), 'HH:mm:ss, MMM dd');
  };

  const startTimer = () => {
    if (isRunning) return;

    const now = Date.now();
    startTimeRef.current = now;

    if (startDateField.value === null) {
      startDateField.onChange(new Date(now));
    }

    endDateField.onChange(null);

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (!isRunning) return;

    const now = Date.now();
    endDateField.onChange(new Date(now));

    setIsRunning(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (autoStart) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View className="rounded-xl border border-dashed border-success-500 bg-white p-2 dark:bg-background-secondary-dark">
      <View className="mb-4 items-center justify-center rounded-lg bg-softSecondary p-2">
        <Text className="text-2xl font-bold text-secondary dark:text-white">
          {formatTimeSeconds(elapsedTime)}
        </Text>
      </View>

      <View className="mb-4 flex-row justify-center gap-2">
        <Pressable
          className={`flex-1 items-center justify-center rounded-xl p-3 ${
            isRunning ? 'bg-softSecondary' : 'bg-success-500'
          }`}
          onPress={startTimer}
          disabled={isRunning}
        >
          <Text
            className={cn(
              'font-medium',
              isRunning
                ? 'text-success-500'
                : 'text-background-secondary dark:bg-background-secondary-dark',
            )}
          >
            Start
          </Text>
        </Pressable>

        <Pressable
          className={cn(
            'flex-1 items-center justify-center rounded-xl p-3',
            !isRunning ? 'bg-softSecondary' : 'bg-red-500',
          )}
          onPress={stopTimer}
          disabled={!isRunning}
        >
          <Text
            className={cn(
              'font-medium',
              isRunning
                ? 'text-background-secondary dark:text-background-secondaryDark'
                : 'text-secondary',
            )}
          >
            Stop
          </Text>
        </Pressable>
      </View>

      <View className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-300 text-xs">
            Started:
          </Text>
          <Text className="text-gray-800 text-xs font-medium dark:text-white">
            {formatDate(startDateField.value)}
          </Text>
        </View>

        <View className="mt-2 flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-300 text-xs">
            Stopped:
          </Text>
          <Text className="text-gray-800 text-xs font-medium dark:text-white">
            {formatDate(endDateField.value)}
          </Text>
        </View>
      </View>
    </View>
  );
}
