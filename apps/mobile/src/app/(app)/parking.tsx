/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { Platform, Image } from 'react-native';

import { Header, RootWrapper } from '@/components/common';
import { ParkingStatics } from '@/components/core';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';

export default function Parking() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const tabs = [
    {
      href: 'manage-parking',
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/new-car.png')
          : require('assets/icons/light/new-car.png'),
      label: t('parking.manage'),
    },
    {
      href: 'makulera',
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/danger.png')
          : require('assets/icons/light/danger.png'),
      label: t('parking.Makulera'),
    },
    {
      href: 'felparkering',
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/felparkering.png')
          : require('assets/icons/light/felparkering.png'),
      label: t('parking.felparkering'),
    },
  ];

  const { push } = useRouter();

  return (
    <ScrollView className="container">
      <RootWrapper>
        <Header title={t('parking.title')} />
        <View className="my-2 flex-row flex-wrap justify-between gap-2">
          {React.Children.toArray(
            tabs.map(
              (item) =>
                Platform.OS === 'android' && (
                  <TouchableOpacity
                    onPress={() => push(`/${item.href}`)}
                    className="dark:bg-background-secondary-dark border border-secondary/10 aspect-square h-full max-h-[160px] w-[48.5%] items-center justify-center gap-2 rounded-3xl bg-white md:w-[24%]"
                  >
                    <Image className="size-16" source={item.icon} />
                    <Text className="text-secondary text-center font-bold dark:text-yellow-400">
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ),
            ),
          )}
        </View>
        <ParkingStatics />
      </RootWrapper>
    </ScrollView>
  );
}
