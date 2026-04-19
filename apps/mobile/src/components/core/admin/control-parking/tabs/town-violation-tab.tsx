import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { Button, ControlledInput } from '@/components/ui';

import { LocationSelector } from '../town';
import { ViolationSelector } from '../violations';
import { type LocationValidationFrom, locationViolationSchema } from './types';

export function TownViolationTab() {
  const { control, handleSubmit } = useForm<LocationValidationFrom>({
    resolver: zodResolver(locationViolationSchema),
  });

  const addViolationForTown = useSafeMutation(
    api.staticData.createLocationViolation,
  );

  const onSubmit = async (data: LocationValidationFrom) => {
    const result = await addViolationForTown({
      locationId: data.location as Id<'locations'>,
      violationId: data.violation as Id<'violations'>,
      price: data.price,
    });
    if (result !== null) {
      showMessage({ message: 'Violation added successfully', type: 'success' });
    }
  };

  return (
    <View>
      <ViolationSelector control={control} name="violation" />
      <LocationSelector control={control} name="location" />
      <ControlledInput
        label="Price"
        placeholder="Price"
        control={control}
        name="price"
        keyboardType="number-pad"
      />
      <Button
        label="Submit"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
