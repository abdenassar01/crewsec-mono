import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { t } from 'i18next';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Button, Image, Text } from '@/components/ui';
import { Modal, useModal } from '@/components/ui/modal';

interface Props {
  userId: Id<'users'>;
}

export function DeleteUserModal({ userId }: Props) {
  const { dismiss, ref, present } = useModal();

  const deleteUser = useSafeMutation(api.users.deleteUser);

  return (
    <>
      <TouchableOpacity onPress={present} className="">
        <Image
          className="aspect-square size-6"
          source={require('assets/icons/trash.png')}
        />
      </TouchableOpacity>
      <Modal index={0} snapPoints={['17%', '25%']} ref={ref}>
        <View className="justify-center p-3">
          <Text className="text-center text-xs">
            {t('manage-parking.sure-remove-user')}
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
              onPress={() => deleteUser({ userId })}
              label={t('yes')}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
