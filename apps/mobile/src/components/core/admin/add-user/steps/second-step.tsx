import React from 'react';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { UploadAvatar } from '@/components/common';
import { ControlledInput, Text } from '@/components/ui';

interface Props {
  control: Control<any>;
}

export function AddUserSecondStep({ control }: Props) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="my-2 text-center font-bold text-secondary">
        {t('add-user.step-two')}
      </Text>
      <UploadAvatar control={control} name="image" />
      <ControlledInput
        label={t('forms.parking-name')}
        placeholder={t('forms.parking-name')}
        control={control}
        name="parkingName"
      />
      <ControlledInput
        label={t('forms.website')}
        placeholder={t('forms.website')}
        control={control}
        name="website"
      />
      <ControlledInput
        label={t('forms.description')}
        placeholder={t('forms.description')}
        control={control}
        name="description"
        multiline
        numberOfLines={4}
        className="min-h-40"
      />
    </View>
  );
}
