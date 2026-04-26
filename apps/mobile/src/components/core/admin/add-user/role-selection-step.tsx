import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Image, Text, TouchableOpacity } from '@/components/ui';
import { useSelectedTheme } from '@/lib';

interface Props {
  onRoleSelect: (role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT') => void;
}

export function RoleSelectionStep({ onRoleSelect }: Props) {
  const { t } = useTranslation();
  const { selectedTheme } = useSelectedTheme();
  const isDark = useMemo(() => selectedTheme === 'dark', [selectedTheme]);

  const roles = [
    {
      key: 'ADMIN',
      title: t('add-user.roles.admin.title'),
      description: t('add-user.roles.admin.description'),
      icon: isDark
        ? require('assets/icons/dark/admin.png')
        : require('assets/icons/light/admin.png'),
    },
    {
      key: 'EMPLOYEE',
      title: t('add-user.roles.employee.title'),
      description: t('add-user.roles.employee.description'),
      icon: isDark
        ? require('assets/icons/dark/user.png')
        : require('assets/icons/light/user.png'),
    },
    {
      key: 'CLIENT',
      title: t('add-user.roles.client.title'),
      description: t('add-user.roles.client.description'),
      icon: isDark
        ? require('assets/icons/dark/user.png')
        : require('assets/icons/light/user.png'),
    },
  ];

  return (
    <View className="mt-5">
      <Text className="text-center font-bold text-secondary dark:text-yellow-400">
        {t('add-user.role-selection.title')}
      </Text>
      <Text className="text-center text-xs text-text">
        {t('add-user.role-selection.description')}
      </Text>

      <View className="mt-5 flex-row gap-2">
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            onPress={() =>
              onRoleSelect(role.key as 'ADMIN' | 'EMPLOYEE' | 'CLIENT')
            }
            className="w-1/3 items-center gap-4 rounded-xl bg-white p-2 dark:bg-background-secondary-dark"
          >
            <Image
              source={role.icon}
              className="size-12 rounded-lg bg-secondary/10 p-3 dark:bg-primary/10"
            />
            <View className="">
              <Text className="text-center !text-xxs font-bold text-secondary dark:text-yellow-400">
                {role.title}
              </Text>
              <Text className="text-center !text-xxs text-secondary/70 dark:text-yellow-400/70">
                {role.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
