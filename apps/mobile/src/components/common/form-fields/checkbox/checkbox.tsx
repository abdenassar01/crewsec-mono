import * as React from 'react';
import { type Control, useController } from 'react-hook-form';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { cn } from '@/lib/helpers';

type Props = {
  control: Control<any>;
  name: string;
  label: string;
};

export function ControlledCheckBox({ control, name, label }: Props) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ control, name, defaultValue: false });

  return (
    <View>
      <TouchableOpacity
        onPress={() => onChange(!value)}
        className="mt-4 flex-row"
      >
        <View
          className={cn(
            'w-5 h-5 rounded border-[1px] justify-center items-center border-secondary dark:border-main',
            value ? 'bg-secondary dark:bg-main' : '',
          )}
        >
          {value && (
            <Image
              className="size-4"
              source={require('assets/icons/checkbox.png')}
            />
          )}
        </View>
        <Text className="ml-1">{label}</Text>
      </TouchableOpacity>
      <Text className="text-error text-xs">{error?.message}</Text>
    </View>
  );
}
