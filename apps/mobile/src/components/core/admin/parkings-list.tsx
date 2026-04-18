/* eslint-disable max-lines-per-function */
import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Image, Input, Text } from '@/components/ui';
import { primary } from '@/components/ui/colors';
import { cn, truncateString } from '@/lib';

interface Props {
  setSelectedParking: React.Dispatch<
    React.SetStateAction<Id<'parkings'> | undefined>
  >;
  selected?: Id<'parkings'>;
  resource: 'felparkering' | 'makulera' | 'parking';
}

export function ParkingsList({ setSelectedParking, selected }: Props) {
  const [searchText, setSearchText] = useState('');
  const data = useSafeQuery(api.parkings.list, { query: searchText });
  const { height } = useWindowDimensions();

  if (data === undefined && !searchText)
    return (
      <View className="mt-3 w-full items-center justify-center rounded-xl bg-white p-2 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} color={primary} />
      </View>
    );

  return (
    <ScrollView
      className=""
      showsVerticalScrollIndicator={false}
      contentContainerClassName=""
      style={{ height: height - 140 }}
    >
      <Input
        value={searchText}
        placeholder="Search..."
        onChangeText={(text) => setSearchText(text)}
      />
      <FlashList
        data={data}
        numColumns={2}
        contentContainerClassName="gap-2 pb-20"
        ItemSeparatorComponent={() => <View className="size-2" />}
        keyExtractor={(item) => item._id}
        renderItem={(item) => (
          <TouchableOpacity
            key={item.item._id}
            onPress={() => setSelectedParking(item.item._id)}
            className={cn(
              'rounded-xl border border-secondary/10 bg-background-secondary mb-2 web:w-full dark:bg-background-secondary-dark p-1',
              item.index % 2 ? 'ml-1' : 'mr-1',
              selected === item.item._id
                ? 'border-secondary dark:border-primary'
                : 'border-background-secondary dark:border-background-secondary-dark',
            )}
          >
            <Image
              source={{ uri: item.item.imageUrl || undefined }}
              className="aspect-video w-full rounded-lg"
            />
            <View className="p-1">
              <Text className="font-bold text-secondary">{item.item.name}</Text>
              <Text className="text-xs">
                {truncateString(item.item.address, 20)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}
