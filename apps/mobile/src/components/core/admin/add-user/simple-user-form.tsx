/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { UploadAvatar } from '@/components/common/form-fields/upload-avatar';
import {
  ActivityIndicator,
  Button,
  ControlledInput,
  Text,
} from '@/components/ui';

const simpleUserFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN']),
  avatar: z.string().optional(),
});

export type SimpleUserFormValues = z.infer<typeof simpleUserFormSchema>;

interface Props {
  selectedRole: 'ADMIN' | 'EMPLOYEE' | 'SUPER_ADMIN';
  onSubmit?: (_data: SimpleUserFormValues) => Promise<void>;
  onBack?: () => void;
  pending?: boolean;
}

export function SimpleUserForm({
  selectedRole,
  onSubmit,
  onBack,
  pending = false,
}: Props) {
  const { height: _height } = useWindowDimensions();

  const { control, handleSubmit } = useForm<SimpleUserFormValues>({
    resolver: zodResolver(simpleUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      role: selectedRole,
      avatar: undefined,
    },
  });

  if (pending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={50} />
        <Text className="mt-4 text-center text-secondary">
          Creating user...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      className=""
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: _height - 150 }} className="p-4">
          <Text className="my-4 text-center font-bold text-secondary">
            Create {selectedRole === 'ADMIN' ? 'Admin' : 'Employee'} Account
          </Text>

          <View className="mb-6 flex items-center justify-center">
            <UploadAvatar
              control={control}
              name="avatar"
              className="size-24"
              imgClassName="w-24 h-24 rounded-full aspect-square"
            />
            <Text className="mt-2 text-sm text-secondary/70 dark:text-yellow-400/70">
              Profile Photo
            </Text>
          </View>

          <ControlledInput
            label="Email"
            placeholder="user@example.com"
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ControlledInput
            label="Password"
            placeholder="Min 8 characters"
            control={control}
            name="password"
            password
          />

          <ControlledInput
            label="Name"
            placeholder="Full name"
            control={control}
            name="name"
          />

          <ControlledInput
            label="Phone (optional)"
            placeholder="+46 70 123 45 67"
            control={control}
            name="phone"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
      <View className="flex-row justify-between gap-[2%] px-4">
        {onBack && <Button className="w-[49%]" onPress={onBack} label="Back" />}
        <Button
          className={onBack ? 'w-[49%]' : 'w-full'}
          onPress={handleSubmit(async (data) => {
            if (onSubmit) {
              await onSubmit(data);
            }
          })}
          disabled={pending}
          label={pending ? 'Creating...' : 'Create User'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
