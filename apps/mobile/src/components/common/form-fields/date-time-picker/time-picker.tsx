import React, { useState } from 'react';
import { type Control, useController } from 'react-hook-form';
import { Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';

import { Button, ControlledInput, Text, View } from '@/components/ui';

type Props = {
  control: Control<any>;
  name: string;
  callback?: () => void;
};

export function TimePicker({ control, name, callback }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const {
    field: { onChange, value },
    fieldState: { error, isDirty },
  } = useController({
    name,
    control,
    defaultValue: '00:00',
  });

  return (
    <View className="w-full">
      {Platform.OS === 'web' ? (
        <View className="flex-row justify-between">
          <ControlledInput
            className="bg-background-secondary dark:bg-background-secondary-dark"
            wrapperClassName="px-2"
            keyboardType="numeric"
            control={control}
            name={`${name}-hour`}
          />
          <ControlledInput
            className="bg-background-secondary dark:bg-background-secondary-dark"
            wrapperClassName="px-2"
            keyboardType="numeric"
            control={control}
            name={`${name}-min`}
          />
        </View>
      ) : (
        <DatePicker
          date={date}
          mode="time"
          onDateChange={(date) => {
            setDate(date);
            onChange(
              `${date.getHours().toString().padStart(2, '0')}:${date
                .getMinutes()
                .toString()
                .padStart(2, '0')}`,
            );
          }}
        />
      )}

      <View className="w-full flex-row items-center justify-between rounded-full bg-background-secondary p-2 py-1 dark:bg-background-secondary-dark">
        <Text className="pl-5 text-2xl font-medium">{value}</Text>
        {isDirty && <Button label="Submit" onPress={callback} />}
      </View>
      <Text className="text-[10px] text-danger-500">{error?.message}</Text>
      <View className="h-10 w-full" />
    </View>
  );
}
