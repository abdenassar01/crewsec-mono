/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Header, RootWrapper } from '@/components/common';
import { UpdateUserForm } from '@/components/core/admin/update-user/admin-user-form';
import { ActivityIndicator, Text, View } from '@/components/ui';

export default function UpdateAdminUser() {
  const { t } = useTranslation();
  const router = useRouter();

  const { userId } = useLocalSearchParams<{ userId: Id<'users'> }>();

  const data = useSafeQuery(api.users.getById, {
    userId: userId,
  });

  const updateUser = useSafeMutation(api.users.update);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    if (!userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUser({
        userId,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role || data?.role,
        enabled: formData.enabled,
        organizationId: formData.organizationId || undefined,
      });

      // Success - navigate back
      router.back();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(t('forms.errors.update-failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RootWrapper className="container">
      <Header title={t('add-user.update-user-info')} />
      <View>
        {data === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={50} />
          </View>
        ) : data ? (
          <>
            {error && (
              <View className="mx-4 mb-4 rounded-lg bg-red-100 p-3">
                <Text className="text-center text-red-600">{error}</Text>
              </View>
            )}
            <UpdateUserForm
              user={data}
              pending={isSubmitting}
              onSubmit={handleSubmit}
            />
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-secondary">
              {t('admin.no-users')}
            </Text>
          </View>
        )}
      </View>
    </RootWrapper>
  );
}
