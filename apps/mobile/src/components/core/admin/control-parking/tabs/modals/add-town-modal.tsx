import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { LocationSelector } from '@/components/common';
import {
  Button,
  ControlledInput,
  Image,
  Modal,
  useModal,
} from '@/components/ui';

const townSchema = z.object({
  locationId: z.string({ required_error: 'Town Location is required' }),
  number: z.number({ required_error: 'Town number is required' }),
  label: z.string({ required_error: 'Town name is required' }),
});
type FormValues = z.infer<typeof townSchema>;

export function AddTownModal() {
  const { present, ref, dismiss } = useModal();
  const colorScheme = useColorScheme();
  const [isPending, setIsPending] = useState<boolean>(false);
  const { t } = useTranslation();

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(townSchema),
  });

  const addTown = useSafeMutation(api.staticData.createTown);

  const onSubmit = (town: FormValues) => {
    addTown({ ...town, locationId: town.locationId as Id<'locations'> })
      .then(() =>
        showMessage({
          message: 'Successfully added the Town',
          type: 'success',
        }),
      )
      .catch((e) => {
        console.log('[Debug | adding town]: ', e);
        showMessage({ message: 'Failed to add a town', type: 'danger' });
      })
      .finally(() => {
        setIsPending(false);
        dismiss();
      });
  };
  return (
    <>
      <TouchableOpacity
        onPress={present}
        className="absolute bottom-2 right-0 z-10 rounded-full bg-secondary p-3 dark:bg-primary"
      >
        <Image
          className="size-8"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/plus.png')
              : require('assets/icons/light/plus.png')
          }
        />
      </TouchableOpacity>
      <Modal snapPoints={['40%', '50%']} ref={ref}>
        <View className="container mt-2 w-full flex-1 gap-2 p-2">
          <LocationSelector control={control} name="location" />
          <ControlledInput
            label={t('control.towns')}
            placeholder={t('control.towns')}
            control={control}
            name="label"
            className="bg-background"
            sheet
          />
          <View className="w-full flex-row justify-end">
            <Button
              label={t('forms.submit')}
              loading={isPending}
              onPress={handleSubmit(onSubmit, (err) =>
                console.log('ERR: ', err),
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
