import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Header, RootWrapper } from '@/components/common';
import {
  LocationTab,
  TownTab,
  TownViolationTab,
  ViolationTab,
} from '@/components/core';
import { Text } from '@/components/ui';
import { cn } from '@/lib';

function getTab(tab: string) {
  switch (tab) {
    case 'location':
      return <LocationTab />;
    case 'town':
      return <TownTab />;
    case 'violation':
      return <ViolationTab />;
    case 'town-violation':
      return <TownViolationTab />;
    default:
      break;
  }
}

export default function Control() {
  const { t } = useTranslation();

  const tabs = [
    {
      title: t('control.locations'),
      value: 'location',
    },
    {
      title: t('control.towns'),
      value: 'town',
    },
    {
      title: t('control.violation'),
      value: 'violation',
    },
    {
      title: t('control.submit'),
      value: 'town-violation',
    },
  ];

  const [currentTab, setCurrentTab] = React.useState<string>('location');

  return (
    <RootWrapper className="container">
      <Header title={t('parking.vehicle-control')} />
      <KeyboardAvoidingView>
        <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-2"
            className="mb-3 rounded-xl bg-white p-2 dark:bg-background-secondary-dark"
          >
            {React.Children.toArray(
              tabs.map((item) => (
                <TouchableOpacity
                  className={cn(
                    'rounded-lg p-2 px-4 border',
                    item.value === currentTab
                      ? 'border-success-600 bg-[#16A34A30]'
                      : 'border-background bg-background',
                  )}
                  onPress={() => setCurrentTab(item.value)}
                >
                  <Text
                    className={cn(
                      '!text-xxs',
                      item.value === currentTab
                        ? 'text-success-600'
                        : 'text-secondary',
                    )}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )),
            )}
          </ScrollView>
          {getTab(currentTab)}
        </ScrollView>
      </KeyboardAvoidingView>
    </RootWrapper>
  );
}
