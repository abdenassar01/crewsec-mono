import React from 'react';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ControlledInput, Text } from '@/components/ui';

interface AddUserFirstStepProps {
  control: Control<any>;
  update?: boolean;
}

export function AddUserFirstStep({ control, update }: AddUserFirstStepProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="my-2 text-center font-bold text-secondary">
        {t('add-user.step-one')}
      </Text>
      <ControlledInput
        label={t('forms.email')}
        placeholder={t('forms.email')}
        control={control}
        name="email"
      />
      {!update && (
        <ControlledInput
          label={t('forms.password')}
          placeholder={t('forms.password')}
          control={control}
          password
          name="password"
        />
      )}
      <ControlledInput
        label={t('forms.name')}
        placeholder={t('forms.name')}
        control={control}
        name="name"
      />
      <ControlledInput
        label={t('forms.phone')}
        placeholder={t('forms.phone')}
        control={control}
        name="phone"
      />
    </View>
  );
}
