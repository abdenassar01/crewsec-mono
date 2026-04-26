import { Image } from 'react-native';
import React, { useEffect } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { Text, View } from 'react-native';

import { type AnyControl } from '@/components/ui';
import { useCheckParking } from '@/hooks/use-easypark';

interface Props {
  control: AnyControl;
  name: string;
}

export function EasyparkCheckReference({ control, name }: Props) {
  const { t } = useTranslation();

  const { reference } = useWatch({ control });

  const { data, loading, error } = useCheckParking(reference);

  const {
    field: { onChange },
  } = useController({ control, name });

  useEffect(() => {
    data && onChange(data.data);
  }, [data, onChange]);

  if (!reference || reference.length < 6) return null;

  return (
    <View className="my-2 items-center justify-center rounded-xl border border-dashed border-pink-600 bg-white p-2 pt-12 dark:bg-background-secondary-dark">
      <View className="absolute right-2 top-2 flex-row items-center gap-2 rounded-xl bg-purple-500/10 p-2">
        <Image
          className="size-6"
          source={require('assets/icons/easypark.png')}
        />
        <Text className="font-medium text-purple-500">Easypark</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#db2777" size={24} />
      ) : error ? (
        <Text className="text-red-600">
          Error checking parking: {error.message}
        </Text>
      ) : data?.data && data?.data.parkings?.length > 0 ? (
        React.Children.toArray(
          data.data.parkings.map((item) => <ParkingCard parking={item} />),
        )
      ) : (
        <Text className="text-pink-600">
          {t('control-vehicle.no-veh-easypark')}: {reference}
        </Text>
      )}
    </View>
  );
}

export const ParkingCard = ({ parking }: { parking: any }) => {
  return (
    <View className="mt-2 w-full flex-row flex-wrap gap-2">
      <View className="flex-row items-center gap-1 rounded-full bg-secondary/10 p-1 px-2">
        <Image
          className="size-4"
          source={require('assets/icons/parking.png')}
        />
        <Text className="font-medium text-secondary">{parking.areaName}</Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full bg-[#12b98145] p-1 px-2">
        <Image className="size-4" source={require('assets/icons/zone.png')} />
        <Text className="font-medium text-[#12b981]">{parking.areaNo}</Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full bg-pink-500/10 p-1 px-2">
        <Image
          className="size-4"
          source={require('assets/icons/calendar.png')}
        />
        <Text className="text-pink-500">
          {parking.endDateLocal.split('T')[0]}
        </Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full bg-[#E30040]/10 p-1 px-2">
        <Image className="size-4" source={require('assets/icons/time.png')} />
        <Text className="text-[#E30040]">
          {parking.endDateLocal.split('T')[1].split('+')[0]}
        </Text>
      </View>
    </View>
  );
};
