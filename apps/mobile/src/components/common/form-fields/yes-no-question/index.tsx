import React from 'react';
import { type Control, useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { cn } from '@/lib';

interface Props {
  name: string;
  control?: Control<any>;
  question: string;
}

export function YesNoQuestion({ name, control, question }: Props) {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control: control,
    defaultValue: false,
  });

  const { t } = useTranslation();

  return (
    <View className="w-1/2 ">
      <Text className="text-center text-xxs">{question}</Text>
      <View className="mt-2 flex-row items-center justify-center gap-2">
        <TouchableOpacity
          onPress={() => onChange(true)}
          className={cn(
            'w-1/3 items-center justify-center rounded-full p-2 ',
            value ? 'bg-success-500' : 'bg-background-secondary dark:bg-background-secondary-dark',
          )}
        >
          <Text
            className={cn(
              'text-center !text-xxs',
              value ? 'text-white' : 'text-backgroundDark',
            )}
          >
            {t('yes')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange(false)}
          className={cn(
            'w-1/3 items-center justify-center rounded-full p-2 ',
            !value ? 'bg-success-500' : 'bg-background-secondary dark:bg-background-secondary-dark',
          )}
        >
          <Text
            className={cn(
              'text-center !text-xxs',
              !value ? 'text-white' : 'text-backgroundDark',
            )}
          >
            {t('no')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
