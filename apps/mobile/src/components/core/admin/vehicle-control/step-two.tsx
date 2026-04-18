import React from 'react';
import { type Control } from 'react-hook-form';
import { View } from 'react-native';

import { TownSelector } from '../control-parking';

interface Props {
  control: Control<any>;
}

export function VehicleControlStepTwo({ control }: Props) {
  return (
    <View>
      <TownSelector control={control} name="town" />
    </View>
  );
}
