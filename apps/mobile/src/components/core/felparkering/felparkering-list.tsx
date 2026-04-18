import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';
import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import { colors, Text, View, ConfirmationModal } from '@/components/ui';
import { cn } from '@/lib/helpers';

import { FelparkeringResolveSheet } from './felparkering-resolve-sheet';
import { Id } from 'convex/_generated/dataModel';

export function FelparkeringList() {
  const { t } = useTranslation();
  const data = useSafeQuery(api.canceledViolations.getByMyParkingIdAndCause, {
    cause: 'FELPARKERING',
  });

  const deleteMutation = useSafeMutation(api.canceledViolations.remove);

  const handleDelete = async (id: Id<'canceledViolations'>) => {
    try {
      await deleteMutation({ id });
      showMessage({
        message: 'Felparkering deleted successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Failed to delete felparkering',
        type: 'danger',
      });
    }
  };

  return (
    <ScrollView className="mt-2">
      <View className="mt-2 w-full rounded-2xl bg-white p-4 dark:bg-background-secondary-dark">
        {/* Header */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-text dark:text-gray-100">
            {t('admin.felparkering')}
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
            <View className="mb-3 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <Text className="text-2xl">🅿️</Text>
            </View>
            <Text className="text-center text-sm text-gray-500">
              No felparkering reports yet
            </Text>
          </View>
        ) : (
          <FlashList
            contentContainerClassName="gap-2 pb-20"
            data={data}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyExtractor={(item) => `felparkering-${item._id}`}
            renderItem={({ item }) => (
              <View
                key={item._id}
                className={cn(
                  'flex-row items-center gap-3 rounded-xl bg-background p-3 dark:bg-gray-900',
                  item.resolved && 'opacity-60',
                )}
              >
                {/* Status Badge */}
                <View
                  className={cn(
                    'rounded-full size-7 items-center justify-center',
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
                  <View className="mt-0.5 flex-row items-center gap-2">
                    <View
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        item.resolved ? 'bg-green-500' : 'bg-orange-500',
                      )}
                    />
                    <Text
                      className={cn(
                        'text-xs',
                        item.resolved
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400',
                      )}
                    >
                      {item.resolved ? 'Resolved' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center gap-2">
                  <FelparkeringResolveSheet
                    id={item._id}
                    isResolved={item.resolved}
                  />
                  <ConfirmationModal
                    title="Delete Felparkering"
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
