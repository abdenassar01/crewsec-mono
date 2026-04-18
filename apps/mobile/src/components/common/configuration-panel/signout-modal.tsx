import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Modal, useModal } from '@/components/ui/modal';
import { authClient } from '@/lib/auth/auth-client';

export default function SignoutModal() {
  const { dismiss, ref, present } = useModal();
  const { replace } = useRouter();

  return (
    <>
      <TouchableOpacity
        onPress={present}
        className="w-full flex-row items-center justify-between"
      >
        <Text className="text-xs font-bold my-1 text-secondary dark:text-yellow-400">
          {t('login.logout')}
        </Text>
      </TouchableOpacity>
      <Modal index={0} snapPoints={['17%', '25%']} ref={ref}>
        <View className="justify-center p-3">
          <Text className="text-center text-xs dark:!text-textdark">
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
                  replace('/login');
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
