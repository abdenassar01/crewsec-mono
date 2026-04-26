/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import {
  ActivityIndicator,
  colors,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';

import { MakuleraResolveSheet } from './makulera-resolve-sheet';
import { cn } from '@/lib';

interface MakuleraItem {
  _id: Id<'canceledViolations'>;
  _creationTime: number;
  reference: string;
  resolved?: boolean;
  parkingId: Id<'parkings'>;
  cause: string;
  organizationId?: string;
  notes?: string;
}

export function MakuleraList() {
  const { t } = useTranslation();
  const data = useSafeQuery(api.canceledViolations.getByMyParkingIdAndCause, {
    cause: 'MAKULERA',
  }) as MakuleraItem[] | null | undefined;

  const deleteMutation = useSafeMutation(api.canceledViolations.remove);

  const handleDelete = async (id: Id<'canceledViolations'>) => {
    try {
      await deleteMutation({ id });
      showMessage({
        message: 'Makulera deleted successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Failed to delete makulera',
        type: 'danger',
      });
    }
  };

  if (data === undefined) {
    return (
      <View className="mt-3 w-full items-center justify-center rounded-xl bg-white p-2 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  if (data === null) {
    return (
      <View className="mt-5 w-full items-center justify-center rounded-xl bg-white p-2 dark:bg-background-secondary-dark">
        <Text className="text-center font-bold text-secondary dark:text-yellow-400">
          No Makulera data available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="mt-2">
      <View className="mt-2 w-full rounded-2xl bg-white p-4 dark:bg-background-secondary-dark">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-text dark:text-gray-100">
            {t('admin.makulera')}
          </Text>
          {data && data.length > 0 && (
            <View className="rounded-full bg-secondary/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-secondary">
                {data.length}
              </Text>
            </View>
          )}
        </View>

        {data === undefined ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color={colors.secondary} size={40} />
          </View>
        ) : data.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="bg-gray-100 dark:bg-gray-800 mb-3 rounded-full p-4">
              <Text className="text-2xl">📋</Text>
            </View>
            <Text className="text-gray-500 text-center text-sm">
              No makulera appeals yet
            </Text>
          </View>
        ) : (
          <FlashList<MakuleraItem>
            contentContainerClassName="gap-2 pb-20"
            data={data}
            keyExtractor={(item) => `makulera-${item._id}`}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => (
              <View
                key={item._id}
                className={cn(
                  'flex-row items-center gap-3 rounded-xl bg-background p-3 dark:bg-gray-900',
                  item.resolved ? 'opacity-60' : undefined,
                )}
              >
                {/* Status Badge */}
                <View
                  className={cn(
                    'rounded-full size-7 items-center justify-center',
                    item.resolved ? 'bg-green-500' : 'bg-blue-500',
                  )}
                >
                  {item.resolved ? (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  ) : (
                    <Text className="text-xs font-bold text-white">A</Text>
                  )}
                </View>

                {/* Reference and Status */}
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
                <View className="flex-row items-center gap-2">
                  <MakuleraResolveSheet
                    id={item._id}
                    isResolved={!!item.resolved}
                  />
                  <ConfirmationModal
                    title="Delete Makulera"
                    message={`Are you sure you want to delete ${item.reference}?`}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={() => handleDelete(item._id)}
                  >
                    <View className="rounded-full bg-danger-500/10 p-2">
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#ef4444"
                      />
                    </View>
                  </ConfirmationModal>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
