import React from 'react';

import { RootWrapper } from '@/components/common';
import { ManageParkingScreen } from '@/components/core/parking';

export default function ManageParking() {
  return (
    <RootWrapper className="container flex-1">
      <ManageParkingScreen />
    </RootWrapper>
  );
}
