import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/common';
import { ActivityIndicator, ScrollView, View } from '@/components/ui';
import { colors } from '@/components/ui';

import { AddItemSheet, Searchbar, VehicleList } from '../components';

export function ManageParkingScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');

  const data = useSafeQuery(api.vehicles.getMyVehicles, { query });
  const parking = useSafeQuery(api.parkings.getMyParking);

  return (
    <View className="flex-1">
      <AddItemSheet parkingId={parking?.parking?._id} />
      <Header title={t('manage-parking.title')} />
      <ScrollView className="container mt-2">
        <Searchbar value={query} setValue={setQuery} />
        {!data === undefined ? (
          <ActivityIndicator size={40} color={colors.primary} />
        ) : (
          <VehicleList data={data} />
        )}
      </ScrollView>
    </View>
  );
}
