import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { Button, Image, Modal, useModal } from '@/components/ui';
import { authClient } from '@/lib/auth/auth-client';

export function ManagerTopWidget() {
  const { dismiss, present, ref } = useModal();
  const { t } = useTranslation();
  const user = useSafeQuery(api.users.getCurrentUserProfile);

  return (
    <>
      <View className="flex-row items-start justify-between bg-background-secondary p-2 rounded-xl dark:bg-background-secondary-dark border border-secondary/10">
        <View className="flex-row gap-3">
          <Image
            source={{ uri: user?.avatarUrl || undefined }}
            className="!h-32 !w-32 rounded-xl "
          />
          <View className="border-l border-secondary/10 pl-3">
            <Text className="w-full whitespace-nowrap text-xl font-bold uppercase text-secondary">
              {user?.name}
            </Text>
            <Text className="text-xxs">
              {moment(user?._creationTime).format('DD MMM YYYY')}
            </Text>
            <Text className="mt-3 rounded-xl bg-tertiary/20 p-2 text-center text-xs capitalize text-tertiary">
              {user?.role}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={present}
          className="rounded-xl bg-[#FF306B20] p-1.5"
        >
          <Image
            source={require('assets/icons/logout.png')}
            className="aspect-square size-6"
          />
        </TouchableOpacity>
      </View>
      <Modal index={0} snapPoints={['17%', '25%']} ref={ref}>
        <View className="justify-center p-3">
          <Text className="text-center text-xs">
            {t('login.sure-to-signout')}
          </Text>
          <View className="mt-2 flex-row justify-center gap-2">
            <Button
              className="w-32"
              onPress={dismiss}
              label={t('cancel')}
              variant="secondary"
            />

            <Button
              className="w-32"
              onPress={() =>
                authClient.signOut().then(() => {
                  dismiss();
                })
              }
              label={t('yes')}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
