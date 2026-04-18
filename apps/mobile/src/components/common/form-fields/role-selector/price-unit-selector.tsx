import React from 'react';
import { type Control, useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { cn } from '@/lib/helpers';

type Props = {
  control: Control<any>;
  name: string;
  label: string;
};

export function PriceUnitSelector({ control, label, name }: Props) {
  const {
    fieldState: { error },
    field: { onChange, value },
  } = useController({
    name,
    control,
  });

  const { t } = useTranslation();

  const tabs = [
    { value: 'PARKING', label: t('parking') },
    { value: 'DAY', label: t('price-unit.day') },
    { value: 'WEEK', label: t('price-unit.week') },
    { value: 'MONTH', label: t('price-unit.month') },
  ];

  return (
    <View>
      <Text className="!text-xxs">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 mt-2"
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            className={cn(
              'rounded-xl p-2 w-20 justify-center items-center border border-secondary ',
              tab.value === value ? 'bg-secondary' : '',
            )}
            key={`price_unit-item-${tab.value}`}
            onPress={() => onChange(tab.value)}
          >
            <Text
              className={cn(
                'text-xs',
                tab.value === value
                  ? 'text-background-secondary dark:bg-gray-900'
                  : 'text-secondary dark:text-yellow-400',
              )}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text className="!text-xxs text-danger-600">{error?.message}</Text>
    </View>
  );
}
