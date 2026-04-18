import { type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { ControlledInput, Text } from '@/components/ui';
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
    <View className="mb-2 flex-row items-center justify-between">
      <TouchableOpacity onPress={() => isEditing && handleToggle()} className="w-24">
        <Text
          className={`text-sm ${isClosed ? 'text-gray-400 line-through dark:text-gray-600' : 'font-semibold text-text dark:text-white'}`}
        >
          {day}
        </Text>
      </TouchableOpacity>
      {isEditing ? (
        <View className="flex-row items-center gap-2">
          <ControlledInput
            control={control as any}
            name={`workingHours.${index}.open`}
            placeholder="08:00"
            keyboardType="number-pad"
            wrapperClassName="mb-0"
          />
          <Text className="text-xs text-gray-400">-</Text>
          <ControlledInput
            control={control as any}
            name={`workingHours.${index}.close`}
            placeholder="18:00"
            keyboardType="number-pad"
            wrapperClassName="mb-0"
          />
        </View>
      ) : (
        <Text
          className={`text-xs ${isClosed ? 'text-gray-400 dark:text-gray-600' : 'text-text dark:text-gray-100'}`}
        >
          {isClosed ? t('parking-info.closed') : `${wh?.open ?? ''} - ${wh?.close ?? ''}`}
        </Text>
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
