/* eslint-disable max-lines-per-function */
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { ConfigurationPanel, RootWrapper } from '@/components/common';
import {
  CurrentLocationSection,
  ManagerTopWidget,
} from '@/components/core';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';

export default function AdminDashboard() {
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const tabs = [
    {
      title: t('control-vehicle.title'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/risk-management.png')
          : require('assets/icons/light/risk-management.png'),
      route: '/vehicle-control',
    },
    {
      title: t('admin.felparkering'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/felparkering.png')
          : require('assets/icons/light/felparkering.png'),
      route: '/admin/manage-felparkerings',
    },
    {
      title: t('admin.makulera'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/danger.png')
          : require('assets/icons/light/danger.png'),
      route: '/admin/manage-makulera',
    },
    {
      title: t('admin.users'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/users.png')
          : require('assets/icons/light/users.png'),
      route: '/admin/manage-users',
    },
    {
      title: t('admin.vehicles'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/car.png')
          : require('assets/icons/light/car.png'),
      route: '/admin/manage-vehicles',
    },
    {
      title: t('admin.violation'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/control.png')
          : require('assets/icons/light/control.png'),
      route: '/admin/control',
    },
    {
      title: t('admin.control-fee'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/risk-management.png')
          : require('assets/icons/light/risk-management.png'),
      route: '/admin/control-fee',
    },
    {
      title: t('admin.parking-infos'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/parking-infos.png')
          : require('assets/icons/light/parking-infos.png'),
      route: '/admin/parking-infos',
    },
    {
      title: t('admin.stats'),
      icon:
        colorScheme === 'dark'
          ? require('assets/icons/dark/stats-chart.png')
          : require('assets/icons/light/stats-chart.png'),
      route: '/admin/control-fee/stats',
    },
  ];

  return (
    <RootWrapper className="container">
      <ManagerTopWidget />
      <ScrollView showsVerticalScrollIndicator={false} className="mt-3" >
        <ConfigurationPanel />
        <View className="flex-row flex-wrap justify-between gap-y-2 mt-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={`dashboard-item-${tab.title}`}
              onPress={
                // @ts-ignore
                () => push(tab.route)
              }
              className="border-secondary/10 bg-background-secondary dark:bg-background-secondary-dark aspect-square min-h-32 w-[32%] items-center justify-center gap-2 rounded-2xl border px-3 md:w-[24%]"
            >
              <Image
                className="size-12"
                resizeMode="contain"
                source={tab.icon}
              />
              <Text className="text-xxs! text-secondary text-center font-bold dark:text-yellow-400">
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <CurrentLocationSection />
      </ScrollView>
    </RootWrapper>
  );
}
