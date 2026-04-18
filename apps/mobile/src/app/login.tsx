import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { RootWrapper } from '@/components/common';
import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { authClient } from '@/lib/auth/auth-client';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { replace } = useRouter();

  const onSubmit: LoginFormProps['onSubmit'] = async ({ email, password }) => {
    setLoading(true);
    await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
      fetchOptions: {
        onSuccess: (context) => {
          console.log('AUTH: ', context);
          setTimeout(() => {
            console.log('Redirecting to admin dashboard');
            replace('/');
          }, 500);
          showMessage({ message: 'Login successful', type: 'success' });
          setTimeout(() => replace('/'), 500);
          setLoading(false);
        },
        onError: (error) => {
          console.log('AUTH: ', error);
          showMessage({
            message: error.error.message || 'Login failed',
            type: 'danger',
          });
          setLoading(false);
        },
      },
    });
  };
  return (
    <RootWrapper className="flex-1">
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} loading={loading} />
    </RootWrapper>
  );
}
