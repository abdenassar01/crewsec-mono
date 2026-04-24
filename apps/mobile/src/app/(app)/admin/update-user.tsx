/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Header, ProgressBar, RootWrapper } from '@/components/common';
import { UpdateClientParkingForm } from '@/components/core';
import { ActivityIndicator, Text, View } from '@/components/ui';

export default function UpdateParking() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const { parkingId } = useLocalSearchParams<{ parkingId: string }>();

  // Handle both string and array cases for parkingId
  const parkingIdValue = Array.isArray(parkingId) ? parkingId[0] : parkingId;

  const data = useSafeQuery(
    api.parkings.getPublicParkingById,
    { parkingId: (parkingIdValue ?? '') as Id<'parkings'> },
  );

  const updateParkingAndUser = useSafeMutation(api.parkings.updateParkingAndUser);

  if (!parkingIdValue) {
    return (
      <RootWrapper className="container">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center">Parking ID is required</Text>
        </View>
      </RootWrapper>
    );
  }

  return (
    <RootWrapper className="container">
      <Header title={`${t('add-user.update')} ${data?.name || ''}`} />
      <ProgressBar
        className="mt-3"
        header={`${t('forms.step', { step: currentStep })}/3`}
        steps={3}
        currentStep={currentStep}
      />

      <View>
        {data === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={50} />
          </View>
        ) : data === null ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-center">Parking not found</Text>
          </View>
        ) : (
          <UpdateClientParkingForm
            parking={data}
            setCurrentStep={setCurrentStep}
            pending={false}
            currentStep={currentStep}
            onSubmit={async (formData) => {
              await updateParkingAndUser({
                parkingId: parkingIdValue as any,
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                role: (formData.role || 'CLIENT') as "CLIENT" | "EMPLOYEE" | "ADMIN",
                parkingName: formData.parkingName,
                description: formData.description,
                location: formData.location,
                website: formData.website || '',
                address: formData.address || '',
                maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity, 10) : undefined,
                imageStorageId: formData.image as any,
              });
            }}
          />
        )}
      </View>
    </RootWrapper>
  );
}
