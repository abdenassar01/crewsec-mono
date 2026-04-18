import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, Image } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';

import { DeleteUserModal } from '../update-user';

export function UserManagementParkingsList() {
  const { height } = useWindowDimensions();
  const { push } = useRouter();

  const data = useSafeQuery(api.parkings.list, { query: '' });

  return (
    <View style={{ height: height - 120 }}>
      {data === undefined && (
        <ActivityIndicator size={50} color={colors.secondary} />
      )}
      {data && data.length === 0 ? (
        <Text className="mt-5 text-center font-bold text-secondary">
          {t('admin.no-users')}
        </Text>
      ) : (
        <FlashList
          contentContainerClassName="gap-1 pb-20"
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `parking-item-${item._id}`}
          ItemSeparatorComponent={() => <View className="h-2 " />}
          renderItem={({ item }) => (
            <View
              key={item._id}
              className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-2 dark:bg-background-secondary-dark"
            >
              <View className="flex-row items-start gap-2">
                <Image
                  source={{ uri: item.imageUrl || undefined }}
                  className="aspect-square w-32 rounded-lg object-contain"
                />
                <View>
                  <Text className="text-base text-secondary">{`${item.name}`}</Text>
                  <View className="mt-2 rounded-lg bg-purple-500/20 p-2">
                    <Text className="text-xs capitalize text-purple-500">
                      {item.user?.name}
                    </Text>
                  </View>

                  <Text className="text-xs">{`${item.address}`}</Text>
                </View>
              </View>

              <View className="absolute right-2 top-2 flex-row gap-1">
                <TouchableOpacity
                  onPress={() =>
                    push(`/admin/update-user?parkingId=${item._id}`)
                  }
                  className=""
                >
                  <Image
                    className="aspect-square size-6"
                    source={require('assets/icons/edit.png')}
                  />
                </TouchableOpacity>
                {item?.user?._id && <DeleteUserModal userId={item.user?._id} />}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
