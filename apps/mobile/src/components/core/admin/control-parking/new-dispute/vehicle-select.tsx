import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React from 'react';
import { type Control } from 'react-hook-form';

import { ActivityIndicator, ControlledSelect, View } from '@/components/ui';
import { secondary } from '@/components/ui/colors';

interface Props {
  control: Control<any>;
  name: string;
  className?: string;
}

export function VehicleSelect({ control, name, className }: Props) {
  const data = useSafeQuery(api.staticData.listCarBrands, { search: '' });

  return (
    <View className={className}>
      {data === undefined ? (
        <ActivityIndicator size={16} color={secondary} />
      ) : (
        <ControlledSelect
          className="bg-background-secondary dark:bg-background-secondary-dark border border-secondary/10"
          control={control}
          name={name}
          label="Vehicle"
          options={data.map((item) => ({
            label: item.label,
            value: item.label || '',
          }))}
        />
      )}
    </View>
  );
}
