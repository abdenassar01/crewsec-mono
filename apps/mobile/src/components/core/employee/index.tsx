/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { ConfigurationPanel } from '@/components/common';
import { Button, Image, Modal, Text, useModal } from '@/components/ui';
import { useUser } from '@/hooks';
import { useSafeMutation } from '@/hooks/use-convex-hooks';

import { ManagerTopWidget, UpdateNotificationToken } from '../admin';
import { CurrentLocationSection } from '../home';

export function EmployeeScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const { push } = useRouter();
  const { dismiss, present, ref } = useModal();
  const sendNotification = useSafeMutation(
    api.notifications.sendPushNotificationToAdmins,
  );

  const tabs = [
    {
      onClick: () => push('/vehicle-control'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/risk-management.png')
          : require('assets/icons/light/risk-management.png'),
      title: t('parking.vehicle-control'),
    },
    {
      title: t('home.alarm'),
      icon: require('assets/icons/light/alarm.png'),
      darkIcon: require('assets/icons/dark/alarm.png'),
      onClick: present,
    },
    {
      title: t('admin.felparkering'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/felparkering.png')
          : require('assets/icons/light/felparkering.png'),
      onClick: () => push('/admin/manage-felparkerings'),
    },
    {
      title: t('admin.makulera'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/danger.png')
          : require('assets/icons/light/danger.png'),
      onClick: () => push('/admin/manage-makulera'),
    },
    {
      title: t('admin.vehicles'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/car.png')
          : require('assets/icons/light/car.png'),
      onClick: () => push('/admin/manage-vehicles'),
    },
    {
      title: t('admin.parking-infos'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/parking-infos.png')
          : require('assets/icons/light/parking-infos.png'),
      onClick: () => push('/admin/parking-infos'),
    },
  ];

  return (
    <View className="container">
      <UpdateNotificationToken />
      <View className="mt-3">
        <ManagerTopWidget />
        <View className="my-3 flex-row flex-wrap justify-between gap-y-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={`employee-item-${tab.title}`}
              onPress={tab.onClick}
              className="bg-white aspect-square min-h-32 !w-[32%] items-center justify-center gap-2 rounded-2xl px-3"
            >
              <Image
                resizeMode="contain"
                className="size-12"
                source={tab.icon}
              />
              <Text className="text-secondary dark:text-yellow-400 text-center !text-xs font-bold">
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ConfigurationPanel />
        <CurrentLocationSection />
      </View>
      <Modal
        detached
        index={0}
        snapPoints={['10%', '20%']}
        ref={ref}
        className="shadow-lg"
      >
        <View className="justify-center p-3">
          <Text className="text-center text-xs">{t('modal.alarm')}</Text>
          <View className="mt-2 flex-row justify-center gap-2">
            <Button
              className="w-32"
              onPress={dismiss}
              label={t('cancel')}
              variant="secondary"
            />

            <Button
              className="w-32"
              onPress={async () => {
                await sendNotification({
                  title: 'Alarm message',
                  body: `User ${user?.name} is asking you to open microphone.`,
                });
                showMessage({
                  type: 'success',
                  message: 'Notification sent successfully',
                });
                dismiss();
              }}
              label={t('yes')}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
