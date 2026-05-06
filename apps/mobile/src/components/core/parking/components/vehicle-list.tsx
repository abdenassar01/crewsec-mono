import { FlashList } from '@shopify/flash-list';
import { type Doc } from 'convex/_generated/dataModel';
import React from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/helpers';
import { CarReservationCard } from '.';
import { CarReservationSimpleCard } from './car-reservation-simple-card';


interface Props {
  data: Doc<'vehicles'>[];
  showControlFee?: boolean;
}

export function VehicleList({ data,  showControlFee = false }: Props) {
  console.log("data: ", data)
  return (
    <>
      <FlashList
        contentContainerClassName="gap-2 pb-20"
        data={data}
        numColumns={2}
        renderItem={({ index, item }) => (
          <View key={item._id} className={cn('w-full mb-2', index % 2 === 0 ? 'pr-2' : '')}>
            <CarReservationSimpleCard vehicle={item}  />
          </View>
        )}
        keyExtractor={(item, index) => `list-item-${item._id || index}`}
      />
    </>
  );
}
