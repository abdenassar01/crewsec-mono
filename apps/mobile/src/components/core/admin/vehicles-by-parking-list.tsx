/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions } from 'react-native';

import { colors, Input, ScrollView, Text, View } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';

import { AddItemSheet, VehicleList } from '../parking';

interface Props {
  id: Id<'parkings'>;
  refresh?: boolean;
}

export function VehicleByParkingList({ id }: Props) {
  const [query, setQuery] = useState<string>('');
  const { t } = useTranslation();

  const data = useSafeQuery(api.vehicles.search, {
    query,
    parkingId: id,
  });

  if (data === undefined)
    return (
      <View className="mt-3 w-full items-center justify-center rounded-xl bg-white p-2 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );

  // Ensure data is an array before rendering
  if (!Array.isArray(data)) {
    return (
      <Text className="mt-5 text-center font-bold text-secondary">
        Error loading vehicles
      </Text>
    );
  }

  return (
    <View className="w-full">
      <AddItemSheet parkingId={id} isAdmin={true} />
      <ScrollView
        style={{ height: Dimensions.get('window').height - 180 }}
        showsVerticalScrollIndicator={false}
        className="mt-3"
        contentContainerClassName="gap-3"
      >
        <Input
          className="-mb-2 mt-3"
          placeholder={t('forms.reference')}
          value={query}
          onChangeText={(text) => setQuery(text)}
        />
        {data?.length === 0 && (
          <Text className="mt-5 text-center font-bold text-secondary">
            No Vehicle in this parking
          </Text>
        )}
        {data && <VehicleList data={data} />}
      </ScrollView>
    </View>
  );
}
