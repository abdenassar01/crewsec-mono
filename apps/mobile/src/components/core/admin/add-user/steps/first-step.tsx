import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type AnyControl, ControlledInput, Text } from '@/components/ui';

interface AddUserFirstStepProps {
  control: AnyControl;
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
