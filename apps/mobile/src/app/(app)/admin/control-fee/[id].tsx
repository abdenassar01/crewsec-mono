/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';

import { Header, ImageViewer, RootWrapper } from '@/components/common';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { colors } from '@/components/ui';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

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

type DetailRowProps = {
  label: string;
  value: string | number | undefined | null;
  valueClassName?: string;
  children?: React.ReactNode;
};

function DetailRow({ label, value, valueClassName, children }: DetailRowProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap items-center justify-between py-2">
      <Text className="text-sm text-gray dark:text-neutral-400">
        {t(label)}
      </Text>
      {children ?? (
        <Text
          className={cn(
            'text-right text-sm font-medium text-text dark:text-gray-100',
            valueClassName,
          )}
        >
          {value ?? '-'}
        </Text>
      )}
    </View>
  );
}

function GalleryImage({ storageId }: { storageId: Id<'_storage'> }) {
  const url = useSafeQuery(api.files.getUrl, { storageId });

  if (!url) {
    return (
      <View className="size-40 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-700">
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  return (
    <ImageViewer
      source={{ uri: url }}
      className="size-40 rounded-xl bg-neutral-200 dark:bg-neutral-700"
      accessibilityLabel="image"
    />
  );
}

export default function ControlFeeDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const feeId = id as Id<'controlFees'>;

  const feeData = useSafeQuery(api.controlFees.getById, {
    id: feeId,
  });

  const updateStatusMutation = useSafeMutation(api.controlFees.updateStatus);

  const handleStatusChange = async (
    status: 'PAID' | 'CONFLICT' | 'CANCELED',
  ) => {
    try {
      await updateStatusMutation({ id: feeId, status });
      showMessage({
        type: 'success',
        message: `Status updated to ${status.toLowerCase()}`,
      });
    } catch (error) {
      showMessage({
        type: 'danger',
        message:
          error instanceof Error ? error.message : 'Failed to update status',
      });
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('sv-SE');
  };

  const formatBoolean = (value: boolean | undefined) => {
    return value ? t('yes') : t('no');
  };

  const formatStatus = (status: string | undefined) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'awaiting':
        return t('report-status.awaiting');
      case 'paid':
        return t('report-status.resolved');
      case 'canceled':
        return t('report-status.refused');
      case 'conflict':
        return t('statistics.conflict');
      default:
        return status ?? t('not-found');
    }
  };

  return (
    <RootWrapper className="container bg-background-secondary dark:bg-background-secondary-dark">
      <Header title={t('controlFee.details.headerTitle')} />
      <ScrollView
        className="mt-3"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-4"
      >
        {feeData === undefined && (
          <View className="mt-10 flex-1 items-center justify-center">
            <ActivityIndicator size={'large'} color={colors.secondary} />
          </View>
        )}

        {feeData === null && (
          <View className="mt-10 flex-1 items-center justify-center">
            <Text className="text-neutral-500">
              {t('controlFee.details.notFound')}
            </Text>
          </View>
        )}

        {feeData && (
          <View className="gap-4">
            {/* Status and Action Buttons */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-3 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.generalInfo.title')}
              </Text>

              {/* Status Badge */}
              <View className="mb-4">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('controlFee.details.generalInfo.status')}
                </Text>
                <View className="mt-1">
                  <Text
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium capitalize text-white',
                      getStatusColor(feeData.status),
                    )}
                  >
                    {formatStatus(feeData.status?.toLowerCase())}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => handleStatusChange('PAID')}
                  className={cn(
                    'flex-1 min-w-[100px] flex-row items-center justify-center rounded-xl px-3 py-2.5',
                    feeData.status === 'PAID'
                      ? 'bg-green-500'
                      : 'bg-green-500/20',
                  )}
                >
                  <Text
                    className={cn(
                      'text-center text-xs font-semibold',
                      feeData.status === 'PAID'
                        ? 'text-white'
                        : 'text-green-600',
                    )}
                  >
                    {t('statistics.paid')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleStatusChange('CONFLICT')}
                  className={cn(
                    'flex-1 min-w-[100px] flex-row items-center justify-center rounded-xl px-3 py-2.5',
                    feeData.status === 'CONFLICT'
                      ? 'bg-purple-500'
                      : 'bg-purple-500/20',
                  )}
                >
                  <Text
                    className={cn(
                      'text-center text-xs font-semibold',
                      feeData.status === 'CONFLICT'
                        ? 'text-white'
                        : 'text-purple-600',
                    )}
                  >
                    {t('statistics.conflict')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleStatusChange('CANCELED')}
                  className={cn(
                    'flex-1 min-w-[100px] flex-row items-center justify-center rounded-xl px-3 py-2.5',
                    feeData.status === 'CANCELED'
                      ? 'bg-red-500'
                      : 'bg-red-500/20',
                  )}
                >
                  <Text
                    className={cn(
                      'text-center text-xs font-semibold',
                      feeData.status === 'CANCELED'
                        ? 'text-white'
                        : 'text-red-600',
                    )}
                  >
                    {t('statistics.canceled')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* General Info */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-3 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.generalInfo.title')}
              </Text>
              <DetailRow
                label="controlFee.details.generalInfo.reference"
                value={feeData.reference}
              />
              <DetailRow
                label="controlFee.details.generalInfo.vehicleMark"
                value={feeData.mark}
              />
              <DetailRow
                label="controlFee.details.generalInfo.startDate"
                value={formatDate(feeData.startDate)}
              />
              <DetailRow
                label="controlFee.details.generalInfo.endDate"
                value={formatDate(feeData.endDate)}
              />
            </View>

            {/* Location */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-3 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.location.title')}
              </Text>
              <DetailRow
                label="controlFee.details.location.address"
                value={`${feeData.town?.label ?? ''} ${feeData.town?.number ?? ''}`}
              />
              <DetailRow
                label="controlFee.details.location.town"
                value={feeData.town?.label || ''}
              />
            </View>

            {/* Violation */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-3 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.violation.title')}
              </Text>
              <DetailRow
                label="controlFee.details.violation.violation"
                value={`${feeData.violation?.violation?.number ?? ''} - ${feeData.violation?.violation?.label ?? ''}`}
              />
              <DetailRow
                label="controlFee.details.violation.location"
                value={feeData.violation?.location?.label}
              />
              <DetailRow
                label="controlFee.details.violation.price"
                value={`${feeData.violation?.price ?? 'N/A'} kr`}
                valueClassName="text-red-600 dark:text-red-400 font-bold"
              />
            </View>

            {/* Checks */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-3 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.checks.title')}
              </Text>
              <DetailRow
                label="controlFee.details.checks.signsChecked"
                value={formatBoolean(feeData.isSignsChecked)}
              />
              <DetailRow
                label="controlFee.details.checks.photosTaken"
                value={formatBoolean(feeData.isPhotosTaken)}
              />
            </View>

            {/* Ticket Image */}
            {feeData.ticketUrl && (
              <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
                <Text className="mb-2 text-base font-semibold text-text dark:text-gray-100">
                  {t('controlFee.details.ticket.title')}
                </Text>
                <ImageViewer
                  source={{ uri: feeData.ticketUrl }}
                  className="h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"
                  accessibilityLabel="ticket"
                />
              </View>
            )}

            {/* Gallery */}
            <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
              <Text className="mb-2 text-base font-semibold text-text dark:text-gray-100">
                {t('controlFee.details.gallery.title')}
              </Text>
              {feeData.galleryStorageIds &&
              feeData.galleryStorageIds.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  {feeData.galleryStorageIds.map((storageId, index) => (
                    <GalleryImage
                      key={`${storageId}-${index}`}
                      storageId={storageId}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-sm text-gray dark:text-neutral-400">
                  {t('controlFee.details.gallery.noPhotos')}
                </Text>
              )}
            </View>
          </View>
        )}
        <View className="h-20 w-full" />
      </ScrollView>
    </RootWrapper>
  );
}
