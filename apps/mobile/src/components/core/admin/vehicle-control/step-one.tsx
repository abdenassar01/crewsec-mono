import React from 'react';
import { type Control } from 'react-hook-form';
import { Text, View } from 'react-native';

import { VehicleMarkSelector } from '@/components/common';

interface Props {
  control: Control<any>;
}

export function VehicleControlStepOne({ control }: Props) {
  return (
    <View>
      <Text className="font-medium text-secondary">Select vehicle</Text>
      <VehicleMarkSelector control={control} name="vehicle" />
    </View>
  );
}
