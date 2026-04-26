import { type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ControlledInput, Switch, Text } from '@/components/ui';
import { CARD_CLASS, type ParkingInfoFormValues } from './shared';

interface ParkingWorkingHoursProps {
  control: Control<ParkingInfoFormValues>;
  isEditing: boolean;
  setValue: UseFormSetValue<ParkingInfoFormValues>;
  watch: UseFormWatch<ParkingInfoFormValues>;
}

function WorkingHourRow({
  control,
  index,
  day,
  isEditing,
  setValue,
  watch,
}: {
  control: Control<ParkingInfoFormValues>;
  index: number;
  day: string;
  isEditing: boolean;
  setValue: UseFormSetValue<ParkingInfoFormValues>;
  watch: UseFormWatch<ParkingInfoFormValues>;
}) {
  const { t } = useTranslation();
  const wh = watch(`workingHours.${index}`);
  const isClosed = wh?.closed ?? false;

  const handleToggle = () => {
    const current = watch(`workingHours.${index}.closed`) ?? false;
    setValue(`workingHours.${index}.closed`, !current, { shouldDirty: true });
  };

  return (
    <View className="mb-2">
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-sm ${isClosed ? 'text-gray-400 line-through dark:text-gray-600' : 'font-semibold text-text dark:text-white'}`}
        >
          {t(`parking-info.days.${day}`)}
        </Text>
        {isEditing ? (
          <Switch checked={!isClosed} onChange={handleToggle} accessibilityLabel={day} />
        ) : (
          <Text
            className={`text-xs ${isClosed ? 'text-gray-400 dark:text-gray-600' : 'text-text dark:text-gray-100'}`}
          >
            {isClosed ? t('parking-info.closed') : `${wh?.open ?? ''} - ${wh?.close ?? ''}`}
          </Text>
        )}
      </View>
      {isEditing && !isClosed && (
        <View className="mt-1.5 flex-row items-center gap-2">
          <ControlledInput
            control={control as unknown as Control<Record<string, unknown>>}
            name={`workingHours.${index}.open`}
            placeholder="08:00"
            keyboardType="number-pad"
            wrapperClassName="mb-0"
          />
          <Text className="text-xs text-gray-400">-</Text>
          <ControlledInput
            control={control as unknown as Control<Record<string, unknown>>}
            name={`workingHours.${index}.close`}
            placeholder="18:00"
            keyboardType="number-pad"
            wrapperClassName="mb-0"
          />
        </View>
      )}
    </View>
  );
}

export function ParkingWorkingHours({ control, isEditing, setValue, watch }: ParkingWorkingHoursProps) {
  const { t } = useTranslation();
  const workingHours = watch('workingHours') ?? [];

  return (
    <View className={CARD_CLASS}>
      <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
        {t('parking-info.working-hours')}
      </Text>
      {workingHours.map((field: any, index: number) => (
        <WorkingHourRow
          key={`${field.day}-${index}`}
          control={control}
          index={index}
          day={field.day}
          isEditing={isEditing}
          setValue={setValue}
          watch={watch}
        />
      ))}
    </View>
  );
}
