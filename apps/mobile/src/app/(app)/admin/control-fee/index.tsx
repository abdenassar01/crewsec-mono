/* eslint-disable max-lines-per-function */
import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import { Header, RootWrapper } from '@/components/common';
import { TownDropdownSelector } from '@/components/core';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { secondary } from '@/components/ui/colors';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib';

function getStatusColor(status: string) {
  switch (status) {
    case 'AWAITING':
      return 'bg-yellow-400';
    case 'PAID':
      return 'bg-green-500';
    case 'CANCELED':
      return 'bg-red-500';
    case 'CONFLICT':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
}

export default function ControlFee() {
  const { t } = useTranslation();
  const { control, watch } = useForm();
  const { push } = useRouter();

  const selectedTown = watch('towns') as { value: Id<'towns'> } | undefined;

  const data = useSafeQuery(api.controlFees.listWithDetails, {
    paginationOpts: {
      numItems: 50,
      cursor: null,
    },
    townId: selectedTown?.value,
  });

  return (
    <RootWrapper className="container">
      <Header title={t('admin.control-fee')} />
      <View className="mt-2 w-full rounded-3xl bg-white p-3 dark:bg-background-secondary-dark">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="mb-10 mt-2 w-full"
        >
          <View className="flex-row justify-between gap-2">
            <TownDropdownSelector control={control} name="towns" />
            <TouchableOpacity
              className="flex-row items-center gap-2 rounded-full bg-secondary/10 p-2"
              onPress={() => push('/admin/control-fee/stats')}
            >
              <Text className="text-sm text-secondary">Statistik</Text>
              <Image
                className="!h-6 !w-6 rotate-180"
                source={require('assets/icons/light/back.png')}
              />
            </TouchableOpacity>
          </View>

          {data === undefined ? (
            <ActivityIndicator size={20} color={secondary} />
          ) : (
            <FlashList
              className="mt-2"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-2"
              data={data?.page ?? []}
              ItemSeparatorComponent={() => <View className="h-2" />}
              keyExtractor={(item) => `list-item-${item._id}`}
              renderItem={({ item }) => (
                <Link
                  href={{
                    pathname: '/admin/control-fee/[id]',
                    params: { id: item._id },
                  }}
                  asChild
                >
                  <TouchableOpacity key={item._id} className="flex-row items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                    <Text
                      className={cn(
                        'text-xs capitalize p-2 py-1 rounded text-white',
                        getStatusColor(item.status),
                      )}
                    >
                      {item.status}
                    </Text>
                    <Text className="text-xs font-bold text-slate-800">
                      {item.reference}
                    </Text>
                    <Text
                      style={{ backgroundColor: `${secondary}3d` }}
                      className="ml-auto rounded-full p-2 py-1 text-xs font-semibold text-secondary"
                    >
                      {item.violation.price} kr
                    </Text>
                    <Image
                      className="!h-6 !w-6 rotate-180"
                      source={require('assets/icons/light/back.png')}
                    />
                  </TouchableOpacity>
                </Link>
              )}
              ListEmptyComponent={
                <Text className="text-gray-400 mt-10 text-center">
                  No control fees found.
                </Text>
              }
            />
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </RootWrapper>
  );
}
