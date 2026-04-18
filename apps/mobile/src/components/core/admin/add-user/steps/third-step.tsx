import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ControlledInput, Text, View } from '@/components/ui';

interface Props {
  control: Control<any>;
}

export function AddUserThirdStep({ control }: Props) {
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
        control={control}
      />
      <ControlledInput
        name="address"
        label={t('forms.address')}
        placeholder={t('forms.address')}
        control={control}
      />
    </View>
  );
}
