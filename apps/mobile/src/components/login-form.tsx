/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React, { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  ActivityIndicator,
  Button,
  colors,
  ControlledInput,
  Text,
  View,
} from '@/components/ui';

import { RootWrapper } from './common';

const schema = z.object({
  email: z
    .string({
      required_error: 'forms.errors.email-required',
    })
    .email('forms.errors.email-invalid'),
  password: z
    .string({
      required_error: 'forms.errors.password-required',
    })
    .min(8, 'forms.errors.password-invalid'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  loading?: boolean;
};

export const LoginForm = ({ onSubmit = () => {}, loading }: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const colorScheme = useColorScheme();
  const isDark = useCallback(() => colorScheme === 'dark', [colorScheme]);

  const { t } = useTranslation();

  return (
    <View className="container flex-1">
      <RootWrapper className="w-full flex-row justify-end">
        <Image
          className="h-[40px] w-[150px]"
          source={
            isDark()
              ? require('assets/icons/dark/logo.png')
              : require('assets/icons/light/logo.png')
          }
        />
      </RootWrapper>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        className="flex-1 justify-center"
      >
        {loading && <ActivityIndicator size={50} color={colors.secondary} />}
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="py-6 text-center text-xxm font-bold text-secondary dark:text-yellow-400"
          >
            {t('login.welcome')}
          </Text>
        </View>
        <ControlledInput
          testID="email-input"
          control={control}
          name="email"
          placeholder={t('forms.email')}
          label={t('forms.email')}
        />
        <ControlledInput
          testID="password-input"
          control={control}
          name="password"
          label={t('forms.password')}
          placeholder="***"
          password
          secureTextEntry={true}
        />
        <View className="mt-3 gap-2">
          <Button
            className="my-0"
            size="lg"
            testID="login-button"
            label={t('login.login')}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
