/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useColorScheme } from 'react-native';
import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import {
  ActivityIndicator,
  colors,
  ControlledInput,
  Image,
  Text,
  View,
} from '@/components/ui';
import { useDebounce } from '@/lib';

import { type StaticData, staticDataSchema } from './types';

export function ViolationTab() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState<boolean>(false);
  const { height } = useWindowDimensions();

  const { control, handleSubmit, watch } = useForm<StaticData>({
    resolver: zodResolver(staticDataSchema),
  });

  const search = useDebounce(watch('label'), 500);

  const data = useSafeQuery(api.staticData.listViolations, {
    search,
  });

  const addViolation = useSafeMutation(api.staticData.createViolation);

  const onSubmit = ({ label }: StaticData) => {
    setLoading(true);
    addViolation({ number: 0, label })
      .then(() => showMessage({ message: 'Added violation successfully' }))
      .catch(() => showMessage({ message: 'Failed to add violation' }))
      .finally(() => setLoading(false));
  };

  return (
    <View>
      <View className="mt-2 flex-row items-center justify-between gap-1">
        <ControlledInput
          label={t('control.violation')}
          placeholder={t('control.violation')}
          control={control}
          name="label"
          className="w-full"
          wrapperClassName="w-[85%]"
        />
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, (error) =>
            console.log('error', error),
          )}
          className="mt-3 rounded-full border bg-secondary p-2 dark:bg-primary"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Image
              className="aspect-square w-7"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/submit.png')
                  : require('assets/icons/light/submit.png')
              }
            />
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ height: height - 270 }}
        showsVerticalScrollIndicator={false}
        className="mt-2 rounded-xl bg-white p-3 dark:bg-background-secondary-dark"
      >
        {data === undefined && <ActivityIndicator color={colors.primary} />}
        {data?.map((item, index) => (
          <Fragment key={`location-item-${item._id}`}>
            <Text className="text-xs ">{item.label}</Text>
            {index !== data?.length - 1 && (
              <View className="my-2 h-px w-full bg-border" />
            )}
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
