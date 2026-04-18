import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useColorScheme } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Header, RootWrapper } from '@/components/common';
import { FelparkeringList } from '@/components/core';
import {
  ActivityIndicator,
  ControlledInput,
  Image,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { white } from '@/components/ui/colors';

const felparkeringSchema = z.object({
  reference: z
    .string({ required_error: 'Reference is required' })
    .min(6, 'Car matricule should be at least 6 characters long'),
});

type Felparkering = z.infer<typeof felparkeringSchema>;

export default function FelparkeringScreen() {
  const { control, handleSubmit, reset } = useForm<Felparkering>({
    resolver: zodResolver(felparkeringSchema),
  });

  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const data = useSafeQuery(api.parkings.getMyParking);

  const addFelparkering = useSafeMutation(api.canceledViolations.create);
  const onSubmit = ({ reference }: Felparkering) => {
    if (!data?.parking?._id) return;
    addFelparkering({
      reference,
      parkingId: data.parking._id,
      cause: 'FELPARKERING',
      resolved: false,
    });
    reset();
  };

  return (
    <RootWrapper className="container">
      <Header title={t('felparkering.title')} />

      <View className="mt-2 flex-row items-center justify-between gap-1">
        <ControlledInput
          label={t('forms.reference')}
          placeholder={t('forms.reference')}
          control={control}
          name="reference"
          className="w-full"
          wrapperClassName="w-[85%]"
        />
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, (error) =>
            console.log('error', error),
          )}
          className="mt-3 rounded-full bg-secondary p-2 dark:bg-primary"
        >
          {data === undefined ? (
            <ActivityIndicator color={white} />
          ) : (
            <Image
              className="aspect-square size-7"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/submit.png')
                  : require('assets/icons/light/submit.png')
              }
            />
          )}
        </TouchableOpacity>
      </View>

      <FelparkeringList />
    </RootWrapper>
  );
}
