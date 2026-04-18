import React from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from '@/components/ui';
import { useUser } from '@/hooks';

import { LanguageSelector } from './language-selector';
import SignoutModal from './signout-modal';
import { ThemeSelector } from './theme-selector';

export function ConfigurationPanel() {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <View className="border-secondary/10 dark:bg-background-secondary-dark  w-full gap-3 rounded-2xl border bg-white p-2 pl-3">
      <View className="w-full flex-row items-center justify-between">
        <Text className="text-secondary text-xs font-bold dark:text-yellow-400">
          {t('onboarding.theme')}
        </Text>
        <ThemeSelector />
      </View>
      <View className="bg-secondary/10 h-px w-full rounded-full" />
      <View className="w-full flex-row items-center justify-between">
        <Text className="text-secondary text-xs font-bold dark:text-yellow-400">
          {t('onboarding.language')}
        </Text>
        <LanguageSelector />
      </View>
      {user && user?.role === 'CLIENT' && (
        <>
          <View className="bg-background h-px w-full rounded-full dark:bg-gray-900" />
          <SignoutModal />
        </>
      )}
    </View>
  );
}
