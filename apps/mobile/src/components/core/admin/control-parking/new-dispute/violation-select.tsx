import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type AnyControl, ActivityIndicator, ControlledSelect, View } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { secondary } from '@/components/ui/colors';

interface Props {
  control: AnyControl;
  name: string;
  className?: string;
}

export function ViolationSelect({
  control,
  name,
  className,
  locationId: propLocationId,
}: Props & { locationId?: Id<'locations'> }) {
  const { t } = useTranslation();
  const formLocationId = useWatch({
    control,
    name: 'locationId',
  }) as Id<'locations'> | undefined;

  const locationId = propLocationId || formLocationId;

  const data = useSafeQuery(
    api.staticData.listLocationViolations,
    locationId ? { locationId } : 'skip',
  );

  const isLoading = locationId && data === undefined;

  return (
    <View className={className}>
      {isLoading && <ActivityIndicator size={16} color={secondary} />}

      {!isLoading && (
        <ControlledSelect
          control={control}
          name={name}
          className="bg-background-secondary dark:bg-background-secondary-dark border border-secondary/10"
          label={t('control.violation')}
          options={
            data?.map((item) => ({
              label: `${item?.label || ''} - ${item?.price || 0} Kr`,
              value: item?._id || '',
            })) || []
          }
          disabled={!locationId || !data}
          placeholder={
            !locationId ? 'Location required' : t('control.violation')
          }
        />
      )}
    </View>
  );
}
