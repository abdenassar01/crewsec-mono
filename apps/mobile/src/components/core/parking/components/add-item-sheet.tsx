/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import { useColorScheme } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { DateTimePicker } from '@/components/common';
import {
  Button,
  ControlledInput,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useModal,
  View,
} from '@/components/ui';
import { Modal } from '@/components/ui/modal';

interface VehicleFormValues {
  reference: string;
  name?: string;
  'leaveDate-date': string[];
  'joinDate-date': string[];
  'joinDate-time': string;
}

interface Props {
  refresh?: () => void;
  parkingId?: Id<'parkings'>;
  isAdmin?: boolean;
}

export function AddItemSheet({ refresh, parkingId, isAdmin = false }: Props) {
  const colorScheme = useColorScheme();
  const { present, ref, dismiss } = useModal();
  const { control, handleSubmit, reset } = useForm<VehicleFormValues>();

  const { t } = useTranslation();
  const addVehicleMutation = useSafeMutation(
    isAdmin ? api.vehicles.create : api.vehicles.createMyVehicle,
  );
  const [isAdding, setIsAdding] = React.useState(false);

  const mutate = async (params: { vehicle: { reference: string; joinDate: string; leaveDate: string; name: string } }) => {
    if (!parkingId && isAdmin) {
      showMessage({ message: 'Parking ID is required', type: 'danger' });
      return;
    }

    setIsAdding(true);
    try {
      const mutationArgs = {
        reference: params.vehicle.reference,
        name: params.vehicle.name,
        leaveDate: new Date(params.vehicle.leaveDate).getTime(),
        joinDate: new Date(params.vehicle.joinDate).getTime(),
        ...(isAdmin && { parkingId: parkingId }),
      };

      await addVehicleMutation(mutationArgs);
      showMessage({ message: 'Vehicle added successfully', type: 'success' });
      refresh && refresh();
      dismiss();
      reset();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showMessage({ message: 'Failed to add vehicle', type: 'danger' });
    } finally {
      setIsAdding(false);
    }
  };

  const onSubmit = (formData: VehicleFormValues) => {
    try {
      const joinDateArray = formData['joinDate-date'];

      if (
        !joinDateArray ||
        !Array.isArray(joinDateArray) ||
        joinDateArray.length === 0
      ) {
        showMessage({
          message: 'Start date is required',
          type: 'danger',
        });
        return;
      }

      let join = new Date(joinDateArray[0]);
      if (isNaN(join.getTime())) {
        showMessage({
          message: 'Invalid start date format',
          type: 'danger',
        });
        return;
      }

      const joinTimeStr = formData['joinDate-time'];
      if (joinTimeStr) {
        const [hours, minutes] = joinTimeStr.split(':').map(Number);
        join.setHours(hours, minutes, 0, 0);
      } else {
        const now = new Date();
        join.setHours(now.getHours(), now.getMinutes(), 0, 0);
      }

      const leaveDateArray = formData['leaveDate-date'];
      let leave: Date;
      if (
        leaveDateArray &&
        Array.isArray(leaveDateArray) &&
        leaveDateArray.length > 0
      ) {
        leave = new Date(leaveDateArray[0]);
        if (isNaN(leave.getTime())) {
          showMessage({
            message: 'Invalid leave date format',
            type: 'danger',
          });
          return;
        }
        leave.setHours(23, 59, 0, 0);
      } else {
        leave = new Date(join);
        leave.setHours(23, 59, 0, 0);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const joinDateNormalized = new Date(join);
      joinDateNormalized.setHours(0, 0, 0, 0);

      if (joinDateNormalized.getTime() < today.getTime()) {
        showMessage({
          message: t('forms.errors.join-date-past-error'),
          type: 'danger',
        });
        return;
      }

      const joinDateForCompare = new Date(join);
      joinDateForCompare.setHours(0, 0, 0, 0);
      const leaveDateForCompare = new Date(leave);
      leaveDateForCompare.setHours(0, 0, 0, 0);

      if (joinDateForCompare.getTime() > leaveDateForCompare.getTime()) {
        showMessage({
          message: t('forms.errors.start-date-error'),
          type: 'danger',
        });
        return;
      }

      mutate({
        vehicle: {
          reference: formData.reference,
          joinDate: `${join.toISOString()}`,
          leaveDate: `${leave.toISOString()}`,
          name: formData.reference || '',
        },
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      showMessage({
        message: 'An error occurred while processing the dates',
        type: 'danger',
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={present}
        className="absolute bottom-20 right-0 z-10 rounded-full bg-secondary p-4 dark:bg-primary"
      >
        <Image
          className="size-8"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/plus.png')
              : require('assets/icons/light/plus.png')
          }
        />
      </TouchableOpacity>
      <Modal index={0} snapPoints={['30%', '45%']} ref={ref}>
        <ScrollView className="container">
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
            <ControlledInput
              sheet
              control={control}
              name="reference"
              className="bg-background dark:bg-background-dark"
              placeholder={t('manage-parking.reference')}
              label={t('manage-parking.reference')}
            />
            <Text className="mb-1 text-xxs">{t('manage-parking.date')}</Text>
            <View className="flex-row justify-between">
              <DateTimePicker
                control={control}
                name="joinDate"
                className="w-[49%] bg-background dark:bg-background-dark"
                placeholder={t('manage-parking.from')}
                showTimePicker
              />
              <DateTimePicker
                control={control}
                name="leaveDate"
                className="w-[49%] bg-background dark:bg-background-dark"
                placeholder={t('manage-parking.to')}
              />
            </View>
            <Button
              onPress={handleSubmit(onSubmit, (err) =>
                console.log('err: ', err),
              )}
              size="lg"
              className="mt-5"
              disabled={isAdding}
            >
              <View className="flex-row gap-2">
                <Image
                  className="aspect-square w-6"
                  source={
                    colorScheme === 'dark'
                      ? require('assets/icons/dark/plus.png')
                      : require('assets/icons/light/plus.png')
                  }
                />
                <Text className="font-medium text-textdark dark:text-text">
                  {isAdding ? t('forms.updating') : t('forms.submit')}
                </Text>
              </View>
            </Button>
            <View className="h-10 w-full" />
          </KeyboardAvoidingView>
        </ScrollView>
      </Modal>
    </>
  );
}
