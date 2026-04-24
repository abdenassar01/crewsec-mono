/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { type Id } from 'convex/_generated/dataModel';
import { t } from 'i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import {
  ActivityIndicator,
  Button,
  ControlledInput,
  ControlledSelect,
  Text,
} from '@/components/ui';
import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';

const adminUserFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN']),
  enabled: z.boolean(),
  organizationId: z.string().optional(),
});

export type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;

interface User {
  _id: Id<'users'>;
  _creationTime: number;
  email: string;
  name: string;
  phone?: string;
  avatar?: Id<'_storage'>;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'SUPER_ADMIN';
  enabled?: boolean;
  userId: string;
}

interface Props {
  user: User;
  pending?: boolean;
  onSubmit?: (_data: AdminUserFormValues) => Promise<void>;
}

export function UpdateUserForm({ onSubmit, user, pending = false }: Props) {
  const { height: _height } = useWindowDimensions();

  const currentUser = useSafeQuery(api.users.getCurrentUserProfile);
  const organizations = useSafeQuery(api.organizations.list);
  const isSuperAdmin = (currentUser as any)?.role === 'SUPER_ADMIN';
  const orgList = (organizations as any[]) ?? [];

  const orgOptions = orgList.map((org: any) => ({
    label: org.name,
    value: org._id,
  }));

  const { control, handleSubmit } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      phone: user?.phone || '',
      role:
        user?.role === 'ADMIN' ||
        user?.role === 'EMPLOYEE' ||
        user?.role === 'SUPER_ADMIN'
          ? user.role
          : 'EMPLOYEE',
      enabled: true,
      organizationId: (user as any)?.organizationId || '',
    },
  });

  const roleOptions = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Employee', value: 'EMPLOYEE' },
  ];

  if (pending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={50} />
        <Text className="mt-4 text-center text-secondary">
          {t('forms.updating')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={10}
      className=""
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: _height - 170 }} className="p-4">
          <Text className="my-2 text-center font-bold text-secondary">
            {t('add-user.update-user-info')}
          </Text>

          <ControlledInput
            label={t('forms.email')}
            placeholder={t('forms.email')}
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ControlledInput
            label={t('forms.name')}
            placeholder={t('forms.name')}
            control={control}
            name="name"
          />

          <ControlledInput
            label={t('forms.phone')}
            placeholder={t('forms.phone')}
            control={control}
            name="phone"
            keyboardType="phone-pad"
          />

          <ControlledSelect
            label={t('forms.role')}
            control={control}
            name="role"
            options={roleOptions}
            placeholder={t('forms.select-role')}
          />

          {isSuperAdmin && orgOptions.length > 0 && (
            <ControlledSelect
              label="Organization"
              control={control}
              name="organizationId"
              options={orgOptions}
              placeholder="Select organization"
            />
          )}
        </View>
      </ScrollView>
      <View className="flex-row justify-end gap-[2%] px-4">
        <Button
          className="w-full"
          onPress={handleSubmit(async (data) => {
            if (onSubmit) {
              await onSubmit(data);
            }
          })}
          disabled={pending}
          label={pending ? t('forms.updating') : t('forms.submit')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
