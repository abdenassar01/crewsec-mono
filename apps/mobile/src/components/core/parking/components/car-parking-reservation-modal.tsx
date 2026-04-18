/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc, type Id } from 'convex/_generated/dataModel';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';

import { DateTimeFormatter } from '@/components/common';
import { ActivityIndicator, Button, colors, Text, View } from '@/components/ui';

interface Props {
  callback?: () => void;
  openEdit?: () => void;
  vehicle: Doc<'vehicles'>;
}

export function CarParkingReservationModal({
  callback,
  vehicle,
  openEdit,
}: Props) {
  const { t } = useTranslation();

  const deleteVehicleMutation = useSafeMutation(api.vehicles.deleteMyVehicle);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const mutate = async ({ id }: { id: Id<'vehicles'> }) => {
    setIsDeleting(true);
    try {
      await deleteVehicleMutation({ id });
      showMessage({ type: 'success', message: 'Vehicle deleted successfully' });
      callback && callback();
    } catch (error) {
      showMessage({ type: 'danger', message: 'Failed to delete vehicle' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-1"
      className="container"
    >
      <View className="flex-row items-center justify-between ">
        <Text className="text-sm">{t('manage-parking.reference')}</Text>
        <Text className="w-1/2 text-right uppercase text-secondary dark:text-yellow-400">
          {vehicle.reference}
        </Text>
      </View>
      <View className="my-2 h-px rounded-full bg-background" />
      <View className="flex-row items-center justify-between">
        <Text className="text-sm">{t('manage-parking.time-left')}</Text>
        {vehicle.leaveDate && (
          <DateTimeFormatter
            className=" text-right text-success-600"
            time={vehicle.leaveDate || ''}
          />
        )}
      </View>
      <View className="flex-row items-center justify-between">
        <Button
          label={t('manage-parking.remove')}
          onPress={() => mutate({ id: vehicle._id })}
          variant="destructive"
          className="min-w-32"
          textClassName="text-sm"
          children={
            isDeleting && (
              <ActivityIndicator size="small" color={colors.white} />
            )
          }
        />
        {openEdit && (
          <Button
            label={t('manage-parking.expand-date')}
            onPress={openEdit}
            textClassName="text-sm"
          />
        )}
      </View>
      <View className="h-10 w-full" />
    </ScrollView>
  );
}
