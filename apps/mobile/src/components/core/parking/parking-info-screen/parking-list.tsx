import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { ActivityIndicator, Image, Input, Text, TouchableOpacity } from '@/components/ui';
import { primary } from '@/components/ui/colors';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { truncateString } from '@/lib';

interface ParkingListProps {
  onSelect: (id: Id<'parkings'>) => void;
}

export function ParkingList({ onSelect }: ParkingListProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [searchText, setSearchText] = useState('');
  const data = useSafeQuery(api.parkings.list, { query: searchText });

  if (data === undefined && !searchText) {
    return (
      <View className="mt-3 w-full items-center justify-center rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} color={primary} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="mt-5 items-center">
        <Text className="text-center font-bold text-secondary">
          {t('parking-info.not-found')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ height: height - 140 }}>
      <Input
        value={searchText}
        placeholder={`${t('forms.query')}...`}
        onChangeText={(text: string) => setSearchText(text)}
      />
      <FlashList
        data={data}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item) => item._id}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => onSelect(item.item._id)}
            className="mb-3 mr-2 flex-1 rounded-xl border border-secondary/10 bg-background-secondary p-1 dark:bg-background-secondary-dark"
          >
            <Image
              source={{ uri: item.item.imageUrl || undefined }}
              className="aspect-video w-full rounded-lg"
            />
            <View className="p-1">
              <Text className="font-bold text-secondary" numberOfLines={1}>
                {item.item.name}
              </Text>
              <Text className="text-xs" numberOfLines={1}>
                {truncateString(item.item.address, 20)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}
