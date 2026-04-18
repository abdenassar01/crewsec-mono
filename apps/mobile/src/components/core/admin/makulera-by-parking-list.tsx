/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc, type Id } from 'convex/_generated/dataModel';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MakuleraResolveSheet } from '@/components/core/markulera';
import { ActivityIndicator, ScrollView, Text, View } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

interface Props {
  id: Id<'parkings'>;
}

export function MakuleraByParkingList({ id }: Props) {
  const { t } = useTranslation();

  const data = useSafeQuery(api.canceledViolations.getByParkingIdAndCause, {
    parkingId: id,
    cause: 'MAKULERA',
  }) as Doc<'canceledViolations'>[] | undefined;

  if (data === undefined)
    return (
      <View className="mt-3 w-full items-center justify-center rounded-2xl bg-white p-6 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} />
      </View>
    );

  const makuleraViolations = data || [];

  return (
    <View className="mt-3 w-full rounded-2xl bg-white p-3 dark:bg-background-secondary-dark">
      {makuleraViolations.length === 0 && (
        <View className="items-center justify-center py-12">
          <View className="mb-3 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Text className="text-2xl">📋</Text>
          </View>
          <Text className="text-center font-semibold text-gray-500">
            {t('admin.no-makulera')}
          </Text>
        </View>
      )}

      {makuleraViolations.length > 0 && (
        <View className="mb-2 flex-row items-center justify-between px-1">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {makuleraViolations.length} {t('admin.makulera').toLowerCase()}
          </Text>
          <Text className="text-xs text-gray-400">
            {makuleraViolations.filter((v) => v.resolved).length} resolved
          </Text>
        </View>
      )}

      <ScrollView className="mt-2" contentContainerClassName="gap-2">
        {makuleraViolations.map((item) => (
          <View
            key={item._id}
            className={cn(
              'flex-row items-center gap-3 rounded-xl bg-background p-3 dark:bg-gray-900',
              item.resolved ? 'opacity-60' : '',
            )}
          >
            <View
              className={cn(
                'rounded-full p-2',
                item.resolved ? 'bg-green-500' : 'bg-blue-500',
              )}
            >
              {item.resolved ? (
                <Text className="text-xs font-bold text-white">✓</Text>
              ) : (
                <Text className="text-xs font-bold text-white">A</Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold uppercase text-text dark:text-gray-100">
                {item.reference}
              </Text>
              <View className="mt-0.5 flex-row items-center gap-2">
                <View
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    item.resolved ? 'bg-green-500' : 'bg-blue-500',
                  )}
                />
                <Text
                  className={cn(
                    'text-xs',
                    item.resolved
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400',
                  )}
                >
                  {item.resolved ? 'Resolved' : 'Appeal Pending'}
                </Text>
              </View>
            </View>

            <MakuleraResolveSheet id={item._id} isResolved={item.resolved} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
