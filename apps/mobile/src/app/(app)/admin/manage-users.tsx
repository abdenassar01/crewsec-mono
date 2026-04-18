/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Header, RootWrapper } from '@/components/common';
import {
  UserManagementParkingsList,
  UserManagementUsersList,
} from '@/components/core';
import { Text, TouchableOpacity, View, Image, Modal, useModal, Button } from '@/components/ui';
import { cn } from '@/lib';
import { authClient } from '@/lib/auth/auth-client';

export default function ManageUsers() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { push } = useRouter();
  const { dismiss, present, ref } = useModal();

  const [currentTab, setCurrentTab] = useState<
    'parkings' | 'employees' | 'admins'
  >('parkings');

  return (
    <RootWrapper className="container flex-1">
      <Header
        title={t('admin.users')}
        rightAction={
          <TouchableOpacity
            onPress={present}
            className="rounded-xl bg-[#FF306B20] p-1.5"
          >
            <Image
              source={require('assets/icons/logout.png')}
              className="aspect-square size-6"
            />
          </TouchableOpacity>
        }
      />
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
      <TouchableOpacity
        onPress={() => push('/admin/add-user')}
        className="absolute bottom-6 right-2 z-10 rounded-full bg-secondary p-4 dark:bg-primary"
      >
        <Image
          className="size-8"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/plus.png')
              : require('assets/icons/light/plus.png')
          }
        />
      </TouchableOpacity>

      <View className="my-2 flex-row gap-2">
        <TouchableOpacity
          onPress={() => setCurrentTab('parkings')}
          className={cn(
            'rounded-xl p-2 px-4',
            currentTab === 'parkings'
              ? 'bg-secondary/10'
              : 'bg-white/10 dark:bg-background-secondary-dark/10',
          )}
        >
          <Text className="text-xs text-secondary">Parking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentTab('employees')}
          className={cn(
            'rounded-xl  p-2 px-4',
            currentTab === 'employees'
              ? 'bg-secondary/10'
              : 'bg-white/10 dark:bg-background-secondary-dark/10',
          )}
        >
          <Text className="text-xs text-secondary">Employees</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentTab('admins')}
          className={cn(
            'rounded-xl  p-2 px-4',
            currentTab === 'admins'
              ? 'bg-secondary/10'
              : 'bg-white/10 dark:bg-background-secondary-dark/10',
          )}
        >
          <Text className="text-xs text-secondary">Admins</Text>
        </TouchableOpacity>
      </View>
      {currentTab === 'parkings' ? (
        <UserManagementParkingsList />
      ) : (
        <UserManagementUsersList
          role={currentTab === 'admins' ? 'ADMIN' : 'EMPLOYEE'}
        />
      )}
    </RootWrapper>
  );
}
