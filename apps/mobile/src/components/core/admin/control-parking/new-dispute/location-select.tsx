import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React from 'react';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ActivityIndicator, ControlledSelect, View } from '@/components/ui';
import { secondary } from '@/components/ui/colors';

interface Props {
  control: Control<any>;
  name: string;
  className?: string;
}

export function LocationSelect({ control, name, className }: Props) {
  const data = useSafeQuery(api.staticData.listLocations, { search: '' });
  const { t } = useTranslation();
  return (
    <View className={className}>
      {data === undefined ? (
        <ActivityIndicator size={16} color={secondary} />
      ) : (
        <ControlledSelect
          control={control}
          name={name}
          label={t('control.locations')}
          options={data.map((item) => ({
            label: item.label,
            value: item._id,
          }))}
        />
      )}
    </View>
  );
}
