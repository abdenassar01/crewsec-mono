import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Header, RootWrapper } from '@/components/common';
import {
  CarReservationCard,
  ParkingsList,
  VehicleByParkingList,
} from '@/components/core';
import { Image, Input, Text } from '@/components/ui';
import { secondary } from '@/components/ui/colors';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib';

export default function ManageVehicles() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'parkings' | 'vehicles'>(
    'parkings',
  );

  return (
    <RootWrapper className="container">
      <Header title={t('admin.vehicles')} />
      <View className="mt-4 flex-row justify-between gap-5 rounded-xl bg-white p-1 dark:bg-background-secondary-dark">
        <TouchableOpacity
          onPress={() => {
            setSelectedTab('parkings');
          }}
          className={cn(
            'items-center gap-2 w-[47%] justify-center rounded-lg p-2 px-4 flex-row-reverse',
            selectedTab === 'parkings'
              ? 'bg-secondary/10 text-secondary'
              : 'text-textPrimary',
          )}
        >
          <Text className="text-sm">{t('parkings')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab('vehicles');
          }}
          className={cn(
            'items-center gap-2 w-[47%] justify-center rounded-lg p-2 px-4 flex-row-reverse',
            selectedTab === 'vehicles'
              ? 'bg-secondary/10 text-secondary'
              : 'text-textPrimary',
          )}
        >
          <Text className="text-xs">{t('admin.vehicles')}</Text>
        </TouchableOpacity>
      </View>
      {selectedTab === 'parkings' ? <ParkingsTab /> : <VehiclesTab />}
    </RootWrapper>
  );
}

export const ParkingsTab = () => {
  const [selectedParking, setSelectedParking] = useState<
    Id<'parkings'> | undefined
  >(undefined);
  const { t } = useTranslation();

  return (
    <View className="mt-2">
      <View className={cn('flex-row justify-start')}>
        {selectedParking && (
          <TouchableOpacity
            onPress={() => {
              setSelectedParking(undefined);
            }}
            className={cn(
              'items-center gap-2 rounded-lg bg-secondary/10 p-2 px-4 flex-row-reverse',
            )}
          >
            <Text className="text-xs text-secondary">{t('forms.prev')}</Text>
            <Image
              source={require('assets/icons/light/back.png')}
              className={cn('size-5')}
            />
          </TouchableOpacity>
        )}
      </View>
      {selectedParking ? (
        <VehicleByParkingList id={selectedParking} />
      ) : (
        <ParkingsList
          resource="parking"
          setSelectedParking={setSelectedParking}
          selected={selectedParking}
        />
      )}
    </View>
  );
};

// eslint-disable-next-line max-lines-per-function
export const VehiclesTab = () => {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();

  const [query, setQuery] = useState<string>('');

  const vehicles = useSafeQuery(api.vehicles.searchWithDetails, {
    query,
  });

  console.log('Vehicles: ', vehicles);

  return (
    <ScrollView
      className="mt-3"
      style={{ height: height - 140 }}
      showsVerticalScrollIndicator={false}
    >
      <Input
        className="mt-3"
        placeholder={t('forms.reference')}
        value={query}
        onChangeText={(text) => setQuery(text)}
      />

      {vehicles === undefined ? (
        <ActivityIndicator color={secondary} />
      ) : !vehicles?.page ||
        !Array.isArray(vehicles.page) ||
        vehicles.page.length === 0 ? (
        <Text className="mt-5 text-center font-bold text-secondary">
          {t('noResults')}
        </Text>
      ) : (
        <View className="mt-3 gap-2 pb-16">
          {vehicles.page.map((vehicle) => (
            <CarReservationCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};
