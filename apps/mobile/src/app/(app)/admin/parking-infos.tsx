import React from 'react';
import { View } from 'react-native';

import { ParkingInfoScreen } from '@/components/core';
import { RootWrapper } from '@/components/common';

export default function ParkingInfos() {
  return (
    <RootWrapper className='container'>
      <ParkingInfoScreen />
    </RootWrapper>
  );
}
