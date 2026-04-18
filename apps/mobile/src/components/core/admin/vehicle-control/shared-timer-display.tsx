import React, { useEffect, useState } from 'react';
import { type Control, useController } from 'react-hook-form';
import { Text, View } from 'react-native';

interface SharedTimerDisplayProps {
  startTime: number;
  control: Control<any>;
  startDateName: string;
}

const formatElapsedTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function SharedTimerDisplay({
  startTime,
  control,
  startDateName,
}: SharedTimerDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState(
    Math.floor((Date.now() - startTime) / 1000),
  );

  const { field: startDateField } = useController({
    name: startDateName,
    control,
  });

  useEffect(() => {
    if (startDateField.value === undefined) {
      startDateField.onChange(startTime);
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, startDateField]);

  return (
    <View className="absolute bottom-2 left-0 right-0 my-2 rounded-xl border border-dashed border-success-500 bg-white p-4 dark:bg-background-secondary-dark">
      <View className="items-center justify-center">
        <Text className="text-2xl font-bold text-secondary dark:text-white">
          {formatElapsedTime(elapsedTime)}
        </Text>
        <Text className="text-gray-500 text-xs">Elapsed Time</Text>
      </View>
    </View>
  );
}
