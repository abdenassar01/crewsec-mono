import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native-keyboard-controller';

import { ActivityIndicator, Input, Text, View } from '@/components/ui';
import { primary } from '@/components/ui/colors';

import { AddTownModal } from './modals/add-town-modal';

export function TownTab() {
  const [query, setQuery] = React.useState<string>('');

  const data = useSafeQuery(api.towns.search, { query });

  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <KeyboardAvoidingView>
      <AddTownModal />
      <Input
        label={t('control.towns')}
        placeholder={t('control.towns')}
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
      <ScrollView
        style={{ height: height - 260 }}
        showsVerticalScrollIndicator={false}
        className="mt-2 rounded-xl bg-white p-3 dark:bg-background-secondary-dark"
      >
        {data === undefined && <ActivityIndicator color={primary} />}
        {data?.map((item, index) => (
          <Fragment key={`town-item-${item._id}`}>
            <Text className="text-xs ">{item.label}</Text>
            {index !== data?.length - 1 && (
              <View className="my-2 h-px w-full bg-border" />
            )}
          </Fragment>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
