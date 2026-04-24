import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
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

import { DeleteUserModal } from '../update-user';

type Props = {
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
};

export function UserManagementUsersList({ role }: Props) {
  const { height } = useWindowDimensions();
  const { push } = useRouter();

  const data = useSafeQuery(api.users.getUsersByRole, {
    role: role,
  });

  return (
    <View style={{ height: height - 120 }} className="">
      {data === undefined && (
        <ActivityIndicator size={50} color={colors.secondary} />
      )}
      {data && data.length === 0 ? (
        <Text className="text-center font-bold text-secondary">
          {t('admin.no-users')}
        </Text>
      ) : (
        <FlashList
          contentContainerClassName="gap-1 pb-20"
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `parking-item-${item._id}`}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <View
              key={item._id}
              className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-2 dark:bg-background-secondary-dark"
            >
              <View className="flex-row items-start gap-2">
                <Image
                  source={{ uri: item.avatarUrl || undefined }}
                  className="aspect-square w-32 rounded-lg object-contain"
                />
                <View>
                  <Text className="text-base text-secondary">{`${item.name}`}</Text>

                  <Text className="text-xs">{`${item.email}`}</Text>
                </View>
              </View>

              <View className="absolute right-2 top-2 flex-row gap-1">
                <TouchableOpacity
                  onPress={() => {
                    console.log('Update admin user');
                    push(`/admin/update-admin-user?userId=${item._id}`);
                  }}
                  className=""
                >
                  <Image
                    className="aspect-square size-6"
                    source={require('assets/icons/edit.png')}
                  />
                </TouchableOpacity>
                {item?._id && <DeleteUserModal userId={item?._id} />}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
