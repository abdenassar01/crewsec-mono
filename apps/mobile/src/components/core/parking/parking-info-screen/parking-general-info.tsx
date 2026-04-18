import { type Control } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ControlledInput, Text } from '@/components/ui';
import { CARD_CLASS, type ParkingInfoFormValues } from './shared';

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View className="mb-2 flex-row items-center gap-2">
      <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
        {label}
      </Text>
      <Text className="text-xs text-text dark:text-gray-100">{value}</Text>
    </View>
  );
}

interface ParkingGeneralInfoViewProps {
  phone?: string;
  email?: string;
  maxCapacity?: number;
}

export function ParkingGeneralInfoView({
  phone,
  email,
  maxCapacity,
}: ParkingGeneralInfoViewProps) {
  const { t } = useTranslation();

  return (
    <View className={CARD_CLASS}>
      <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
        {t('parking-info.general-info')}
      </Text>
      <InfoRow label={t('forms.phone')} value={phone || t('not-found')} />
      <InfoRow label={t('forms.email')} value={email || t('not-found')} />
      <InfoRow
        label={t('forms.capacity')}
        value={maxCapacity ? `${maxCapacity}` : t('not-found')}
      />
    </View>
  );
}

interface ParkingGeneralInfoEditProps {
  control: Control<ParkingInfoFormValues>;
}

export function ParkingGeneralInfoEdit({ control }: ParkingGeneralInfoEditProps) {
  const { t } = useTranslation();

  return (
    <View className={CARD_CLASS}>
      <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
        {t('parking-info.general-info')}
      </Text>

      <ControlledInput
        control={control}
        name="phone"
        label={t('forms.phone')}
        placeholder="+46 ..."
        keyboardType="phone-pad"
      />

      <ControlledInput
        control={control}
        name="email"
        label={t('forms.email')}
        placeholder="info@parking.se"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <ControlledInput
        control={control}
        name="maxCapacity"
        label={t('forms.capacity')}
        placeholder="50"
        keyboardType="number-pad"
      />

      <ControlledInput
        control={control}
        name="instructions"
        label={t('parking-info.instructions')}
        placeholder={t('parking-info.instructions-placeholder')}
        multiline
        numberOfLines={4}
      />
    </View>
  );
}

interface ParkingInstructionsViewProps {
  instructions?: string;
}

export function ParkingInstructionsView({
  instructions,
}: ParkingInstructionsViewProps) {
  const { t } = useTranslation();

  if (!instructions) return null;

  return (
    <View className={CARD_CLASS}>
      <Text className="mb-2 text-base font-bold text-secondary dark:text-yellow-400">
        {t('parking-info.instructions')}
      </Text>
      <Text className="text-xs text-text dark:text-gray-100">
        {instructions}
      </Text>
    </View>
  );
}
