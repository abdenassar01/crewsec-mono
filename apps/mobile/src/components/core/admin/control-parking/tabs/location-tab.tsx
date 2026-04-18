/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useColorScheme } from 'react-native';
import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { type z } from 'zod';

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

export function LocationTab() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { height } = useWindowDimensions();
  const [loadingMutation, setLoadingMutation] = useState<boolean>(false);

  const { control, handleSubmit, watch } = useForm<StaticData>({
    resolver: zodResolver(staticDataSchema),
  });
  const search = useDebounce(watch('label'), 500);

  const data = useSafeQuery(api.staticData.listLocations, {
    search,
  });
  const addLocation = useSafeMutation(api.staticData.createLocation);

  const onSubmit = (location: z.infer<typeof staticDataSchema>) => {
    try {
      setLoadingMutation(true);
      addLocation({ label: location.label });
      showMessage({ message: 'Location added successfully', type: 'success' });
    } catch (ex) {
      console.log('Exception: ', ex);
      showMessage({ message: "Can't add the location", type: 'danger' });
    } finally {
      setLoadingMutation(false);
    }
  };

  return (
    <View>
      <View className="mt-2 flex-row items-center justify-between gap-1">
        <ControlledInput
          label={t('control.locations')}
          placeholder={t('control.locations')}
          control={control}
          name="label"
          className="w-full"
          wrapperClassName="w-[85%]"
        />
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, (error) =>
            console.log('error', error),
          )}
          className="mt-3 rounded-full bg-secondary p-2 dark:bg-primary"
        >
          {loadingMutation ? (
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
            <Text className="text-xs">{item.label}</Text>
            {index !== data?.length - 1 && (
              <View className="my-2 h-px w-full bg-border" />
            )}
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
