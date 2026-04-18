/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { Header, RootWrapper } from '@/components/common';
import { ActivityIndicator, Button, Input, Text, View } from '@/components/ui';

export default function AddMakulera() {
  const router = useRouter();
  const user = useSafeQuery(api.users.getCurrentUserProfile);

  const { id: parkingId } = useLocalSearchParams();

  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  // Get parking info
  const parking = useSafeQuery(api.parkings.getPublicParkingById, {
    parkingId: parkingId as any,
  }) as Doc<'parkings'> | null | undefined;

  // Create mutation
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
        cause: 'MAKULERA',
        resolved: false,
        parkingId: parkingId as any,
      });

      showMessage({
        type: 'success',
        message: 'Makulera created successfully',
      });

      router.back();
    } catch (error) {
      console.error('Error creating makulera:', error);
      showMessage({
        type: 'danger',
        message: 'Failed to create makulera',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'EMPLOYEE') {
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
      <Header title="Add Makulera" />

      <View className="mt-4 rounded-xl bg-background-secondary p-4 dark:bg-background-secondary-dark">
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-sm font-medium text-secondary dark:text-yellow-400">
              Parking Location
            </Text>
            <Text className="text-lg font-semibold">{parking.name}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {parking.address}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-secondary dark:text-yellow-400">
              Appeal Reference *
            </Text>
            <Input
              className="border-secondary/10 w-full rounded-lg border bg-background-secondary p-3 dark:bg-background-secondary-dark"
              placeholder="Enter appeal reference number"
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
              label={loading ? 'Creating...' : 'Create Makulera'}
              disabled={loading || !reference.trim()}
              className="w-full"
            />
          </View>
        </View>
      </View>
    </RootWrapper>
  );
}
