import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConfigurationPanel } from '@/components/common';
import { Cover } from '@/components/cover';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const { t } = useTranslation();

  return (
    <View className="container flex h-full items-center  justify-center">
      <FocusAwareStatusBar />
      <View className="mb-12 w-full flex-1 items-center justify-end">
        <Cover />
      </View>
      <View className="mt-12 justify-end w-full">
        <ConfigurationPanel />
      </View>
      <SafeAreaView className="mt-6 w-full">
        <TouchableOpacity
          className="mb-4 w-full items-center justify-center rounded-full bg-secondary p-4 dark:bg-primary"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
        >
          <Text className="font-bold text-background dark:text-backgroundDark">
            {t('onboarding.get-started')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
