/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc, type Id } from 'convex/_generated/dataModel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { Header, RootWrapper } from '@/components/common';
import { ActivityIndicator, Button, Input, Text, View } from '@/components/ui';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';

export default function AddFelparkering() {
  const router = useRouter();
  const user = useSafeQuery(api.users.getCurrentUserProfile);

  const { id: parkingId } = useLocalSearchParams();

  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const parking = useSafeQuery(api.parkings.getPublicParkingById, {
    parkingId: parkingId as Id<'parkings'>,
  }) as Doc<'parkings'> | null | undefined;

  const createMutation = useSafeMutation(api.canceledViolations.create);

  const handleSubmit = async () => {
    if (!reference.trim()) {
      showMessage({
        type: 'danger',
        message: 'Reference is required',
      });
      return;
    }

    if (!parkingId) {
      showMessage({
        type: 'danger',
        message: 'Parking ID is required',
      });
      return;
    }

    setLoading(true);
    try {
      await createMutation({
        reference: reference.trim(),
        cause: 'FELPARKERING',
        resolved: false,
        parkingId: parkingId as Id<'parkings'>,
      });

      showMessage({
        type: 'success',
        message: 'Felparkering created successfully',
      });

      router.back();
    } catch (error) {
      console.error('Error creating felparkering:', error);
      showMessage({
        type: 'danger',
        message: 'Failed to create felparkering',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'EMPLOYEE' && user?.role !== 'SUPER_ADMIN') {
      showMessage({
        type: 'warning',
        message: 'Access denied. Admin or employee role required.',
      });
      router.back();
    }
  }, [user, router]);

  if (!parking) {
    return (
      <RootWrapper className="container flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </RootWrapper>
    );
  }

  return (
    <RootWrapper className="container">
      <Header title="Add Felparkering" />

      <View className="dark:bg-background-secondary-dark mt-4 rounded-xl bg-white p-4">
        <View className="space-y-4">
          <View>
            <Text className="text-secondary mb-2 text-sm font-medium dark:text-yellow-400">
              Parking Location
            </Text>
            <Text className="text-lg font-semibold">{parking.name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {parking.address}
            </Text>
          </View>

          <View>
            <Text className="text-secondary mb-2 text-sm font-medium dark:text-yellow-400">
              Reference Number *
            </Text>
            <Input
              className="bg-background w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-900"
              placeholder="Enter reference number (e.g., license plate)"
              value={reference}
              onChangeText={setReference}
              editable={!loading}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View className="mt-6">
            <Button
              onPress={handleSubmit}
              label={loading ? 'Creating...' : 'Create Felparkering'}
              disabled={loading || !reference.trim()}
              className="w-full"
            />
          </View>
        </View>
      </View>
    </RootWrapper>
  );
}
