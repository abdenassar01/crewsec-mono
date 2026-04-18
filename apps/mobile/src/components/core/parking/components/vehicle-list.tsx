import { FlashList } from '@shopify/flash-list';
import { type Doc } from 'convex/_generated/dataModel';
import React from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/helpers';

import { CarReservationCard } from './car-reservation-card';

interface Props {
  data: Doc<'vehicles'>[];
  estimatedSize?: number;
}

export function VehicleList({ data, estimatedSize }: Props) {
  return (
    <>
      <FlashList
        contentContainerClassName="gap-2 pb-20"
        numColumns={2}
        data={data}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ index, item }) => (
          <View key={item._id} className={cn('w-full mb-2', index % 2 === 0 ? 'pr-2' : '')}>
            <CarReservationCard vehicle={item} />
          </View>
        )}
        keyExtractor={(item, index) => `list-item-${item._id || index}`}
      />
    </>
  );
}
