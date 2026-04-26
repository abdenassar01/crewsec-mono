import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type AnyControl, ActivityIndicator, ControlledSelect, View } from '@/components/ui';
import { secondary } from '@/components/ui/colors';

interface Props {
  control: AnyControl;
  name: string;
  className?: string;
}

export function TownSelect({ control, name, className }: Props) {
  const { t } = useTranslation();

  const locationId = useWatch({ control, name: 'locationId' }) as
    | Id<'locations'>
    | undefined;

  const data = useSafeQuery(
    api.staticData.listTowns,
    locationId ? { search: '', locationId } : 'skip',
  );

  const isLoading = locationId && data === undefined;

  return (
    <View className={className}>
      {isLoading ? (
        <ActivityIndicator size={16} color={secondary} />
      ) : (
        <ControlledSelect
          control={control}
          name={name}
          label={t('control.towns')}
          options={
            data?.map((item) => ({
              label: item.label || '',
              value: item._id,
            })) || []
          }
          disabled={!locationId || !data}
          placeholder={
            !locationId ? 'Select a location first' : t('control.towns')
          }
        />
      )}
    </View>
  );
}
