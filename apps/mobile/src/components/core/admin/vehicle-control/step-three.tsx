import React from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import { ViolationSelector } from '@/components/common';

interface Props {
  control: Control<any>;
}

export function VehicleControlStepThree({ control }: Props) {
  const { town } = useWatch({ control });

  return (
    <View>
      <ViolationSelector townId={town} control={control} name="violation" />
    </View>
  );
}
