import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ControlledInput, Text, View } from '@/components/ui';

interface Props<T extends Record<string, any>> {
  control: Control<T>;
}

export function AddUserThirdStep<T extends Record<string, any>>({ control }: Props<T>) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="my-2 text-center font-bold text-secondary">
        {t('add-user.step-two')}
      </Text>
      <ControlledInput
        name="location"
        label={t('home.location')}
        placeholder={t('home.location')}
        control={control as any}
      />
      <ControlledInput
        name="address"
        label={t('forms.address')}
        placeholder={t('forms.address')}
        control={control as any}
      />
    </View>
  );
}
