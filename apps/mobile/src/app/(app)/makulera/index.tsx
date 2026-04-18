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
import { MakuleraList } from '@/components/core';
import {
  ActivityIndicator,
  ControlledInput,
  Image,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { white } from '@/components/ui/colors';

export default function Complaints() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const data = useSafeQuery(api.parkings.getMyParking);
  const addMakulera = useSafeMutation(api.canceledViolations.create);

  const { control, handleSubmit, reset } = useForm<{ reference: string }>({
    resolver: zodResolver(
      z.object({
        reference: z.string({ required_error: 'reference is required' }),
      }),
    ),
  });

  const onSubmit = (makulera: { reference: string }) => {
    if (!data?.parking?._id) return;
    addMakulera({
      cause: 'MAKULERA',
      parkingId: data.parking._id,
      reference: makulera.reference,
      resolved: false,
    });
    reset();
  };

  return (
    <RootWrapper className="container">
      <Header title={t('Makulera.title')} />
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
      <MakuleraList />
    </RootWrapper>
  );
}
