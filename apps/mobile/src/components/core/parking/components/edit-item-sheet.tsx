/* eslint-disable max-lines-per-function */
import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';

// import {
//   type NewVehicle,
//   useUpdateVehicle,
//   type Vehicle,
//   vehicleSchema,
// } from '@/api';
import { DateTimePicker } from '@/components/common';
import { Button, ControlledInput, Text, useModal, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';

export function EditItemSheet({
  open,
  vehicle,
}: {
  vehicle: any;
  open: boolean;
}) {
  const colorScheme = useColorScheme();
  const { present, ref, dismiss } = useModal();

  // const { mutate } = useUpdateVehicle({});

  const { control, handleSubmit } = useForm<any>({
    // resolver: zodResolver(vehicleSchema),
    defaultValues: {
      reference: vehicle.reference,
      // @ts-ignore
      'leaveDate-date': new Date(vehicle.leaveDate).toLocaleDateString(
        'en-us',
        { day: 'numeric', month: 'short', year: 'numeric' },
      ),
      // @ts-ignore
      'joinDate-date': new Date(vehicle.joinDate).toLocaleDateString('en-us', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    },
  });

  const { t } = useTranslation();

  useEffect(() => (open ? present() : dismiss()), [dismiss, open, present]);

  const onSubmit = (vehicle: any) => {
    let leave = new Date(vehicle['leaveDate-date'][0]);
    const time = new Date();
    leave.setHours(23);
    leave.setMinutes(59);

    let join = new Date(vehicle['joinDate-date'][0]);

    const today = new Date();
    today.setHours(time.getHours());

    const joinDateStr = join.toISOString().split('T')[0];
    const todayDateStr = today.toISOString().split('T')[0];

    if (joinDateStr < todayDateStr) {
      showMessage({
        message: t('forms.errors.start-date-error'),
        type: 'danger',
      });
      return;
    }

    // mutate({
    //   id: vehicle.id,
    //   Vehicle: {
    //     reference: vehicle.reference,
    //     joinDate: `${join.toISOString()}`,
    //     leaveDate: `${leave.toISOString()}`,
    //     name: '',
    //     parking: { id: vehicle.parking.id },
    //   },
    // });
  };

  return (
    <>
      <Modal index={0} snapPoints={['37%', '42%']} ref={ref}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          className="container"
        >
          <ControlledInput
            sheet
            control={control}
            name="reference"
            className="bg-background-secondary dark:bg-background-secondary-dark"
            placeholder={t('manage-parking.reference')}
            label={t('manage-parking.reference')}
          />
          <Text className="mb-1 text-xxs">{t('forms.dates')}</Text>
          <View className="flex-row justify-between">
            <DateTimePicker
              control={control}
              name="joinDate"
              className="w-[49%] bg-background-secondary dark:bg-background-secondary-dark"
              placeholder={t('manage-parking.from')}
            />
            <DateTimePicker
              control={control}
              name="leaveDate"
              className="w-[49%] bg-background-secondary dark:bg-background-secondary-dark"
              placeholder={t('manage-parking.to')}
            />
          </View>
          <Button
            onPress={handleSubmit(onSubmit, (err) => console.log('ERR: ', err))}
            size="lg"
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
                {t('forms.submit')}
              </Text>
            </View>
          </Button>
          <View className="h-10 w-full" />
        </ScrollView>
      </Modal>
    </>
  );
}
