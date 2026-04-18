/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeAction } from '@/hooks/use-convex-hooks';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { ConfigurationPanel } from '@/components/common';
import { Button, colors, Modal, useModal } from '@/components/ui';
import { useBluetoothStatus } from '@/lib';

import { HomeHeader } from './home-header';
import { LocationSection } from './location-section';
import { Image } from 'react-native';

export function HomeScreen() {
  const { t } = useTranslation();
  const { push } = useRouter();
  const parkingData = useSafeQuery(api.parkings.getMyParking);
  const parking = parkingData?.parking;
  const { dismiss, present, ref } = useModal();
  const { hasBluetoothPermissions, requestBluetoothPermissions } =
    useBluetoothStatus();
  const sendNotification = useSafeAction(
    api.notifications.sendPushNotificationToAdmins,
  );
  useEffect(() => {
    if (!hasBluetoothPermissions) {
      requestBluetoothPermissions();
    }
  }, []);

  const tabs = [
    [
      {
        name: t('home.parking'),
        icon: require('assets/icons/light/parking.png'),
        darkIcon: require('assets/icons/dark/parking.png'),
        onClick: () => push('/parking'),
      },
      {
        name: t('home.alarm'),
        icon: require('assets/icons/light/alarm.png'),
        darkIcon: require('assets/icons/dark/alarm.png'),
        onClick: present,
      },
    ],
    [
      {
        name: parking?.name,
        icon: require('assets/icons/light/ic_round-web.png'),
        darkIcon: require('assets/icons/dark/ic_round-web.png'),
        onClick: () =>
          Linking.openURL(parking?.website || 'https://crewsec.se/'),
      },
      {
        name: 'Crewsec',
        icon: require('assets/icons/light/web.png'),
        darkIcon: require('assets/icons/dark/web.png'),
        href: () => Linking.openURL('https://crewsec.se/'),
      },
    ],
  ];

  if (!parking) return <ActivityIndicator size={50} color={colors.secondary} />;

  return (
    <>
      <HomeHeader name={parking.name || 'CREWSEC'} />
      <View className="container mt-2">
        <Image
          className="z-10 my-3 aspect-video border border-secondary/10 w-full flex-1 rounded-3xl object-fill"
          source={{ uri: parking?.imageUrl }}
        />
        <View className="md:flex-row md:justify-between">
          {tabs.map((tab, index) => (
            <View
              key={`tab-item-${index}`}
              className="mb-2 flex-row flex-wrap justify-between md:w-[49%]"
            >
              {tab.map((item) => (
                <TouchableOpacity
                  onPress={item.onClick}
                  key={`tab-icon-item-${item.name}`}
                  className="aspect-square min-h-32 border border-secondary/10 py-5 w-[49%] items-center justify-center gap-2 rounded-3xl bg-white px-3 dark:bg-background-secondary-dark"
                >
                  <Image
                    className="hidden size-16 dark:flex"
                    source={item.darkIcon}
                  />
                  <Image className="size-28 dark:hidden" source={item.icon} />
                  <Text className="text-center !text-xbase font-bold text-secondary dark:text-yellow-400">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <ConfigurationPanel />
        <LocationSection />
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
              onPress={() => {
                sendNotification({
                  title: 'Larm',
                  body: `Larm utlöst från parkering: ${parking?.name || 'Okänd'}`,
                });
                dismiss();
              }}
              label={t('yes')}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
