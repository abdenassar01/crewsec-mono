/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc, type Id } from 'convex/_generated/dataModel';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FelparkeringResolveSheet } from '@/components/core/felparkering';
import { ActivityIndicator, ScrollView, Text, View } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

interface Props {
  id: Id<'parkings'>;
}

export function FelparkeringByParkingList({ id }: Props) {
  const { t } = useTranslation();

  const data = useSafeQuery(api.canceledViolations.getByParkingIdAndCause, {
    parkingId: id,
    cause: 'FELPARKERING',
  }) as Doc<'canceledViolations'>[] | undefined;

  if (data === undefined)
    return (
      <View className="mt-3 w-full items-center justify-center rounded-2xl bg-white p-6 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} />
      </View>
    );

  const felparkeringViolations = data || [];

  return (
    <View className="mt-3 w-full rounded-2xl bg-white p-3 dark:bg-background-secondary-dark">
      {felparkeringViolations.length === 0 && (
        <View className="items-center justify-center py-12">
          <View className="bg-gray-100 dark:bg-gray-800 mb-3 rounded-full p-4">
            <Text className="text-2xl">🅿️</Text>
          </View>
          <Text className="text-gray-500 text-center font-semibold">
            {t('admin.no-felparkering')}
          </Text>
        </View>
      )}

      {felparkeringViolations.length > 0 && (
        <View className="mb-2 flex-row items-center justify-between px-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            {felparkeringViolations.length}{' '}
            {t('admin.felparkering').toLowerCase()}
          </Text>
          <Text className="text-gray-400 text-xs">
            {felparkeringViolations.filter((v) => v.resolved).length} resolved
          </Text>
        </View>
      )}

      <ScrollView className="mt-2" contentContainerClassName="gap-2">
        {felparkeringViolations.map((item) => (
          <View
            key={item._id}
            className={cn(
              'flex-row items-center gap-2 rounded-xl bg-background p-1 px-3 dark:bg-gray-900',
              item.resolved && 'opacity-60',
            )}
          >
            {/* Status Badge */}
            <View
              className={cn(
                'rounded-lg p-2 w-10 h-10 items-center justify-center',
                item.resolved ? 'bg-green-500' : 'bg-orange-500',
              )}
            >
              {item.resolved ? (
                <Text className="text-xs font-bold text-white">✓</Text>
              ) : (
                <Text className="text-xs font-bold text-white">!</Text>
              )}
            </View>

            {/* Reference and Status */}
            <View className="flex-1">
              <Text className="text-base font-bold uppercase text-text dark:text-gray-100">
                {item.reference}
              </Text>
              <View className=" flex-row items-center gap-2">
                <View
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    item.resolved ? 'bg-green-500/20' : 'bg-orange-500/20',
                  )}
                />
                <Text
                  className={cn(
                    'text-xs',
                    item.resolved
                      ? 'text-green-600 dark:text-green-600'
                      : 'text-orange-600 dark:text-orange-400',
                  )}
                >
                  {item.resolved ? 'Resolved' : 'Pending'}
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <FelparkeringResolveSheet
              id={item._id}
              isResolved={item.resolved}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
