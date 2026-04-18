import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/common';
import { View } from '@/components/ui';

import { ParkingDetail } from './parking-detail';
import { ParkingList } from './parking-list';

export function ParkingInfoScreen() {
  const { t } = useTranslation();
  const [selectedParking, setSelectedParking] = useState<Id<'parkings'> | null>(null);

  if (selectedParking) {
    return (
      <ParkingDetail
        parkingId={selectedParking}
        onBack={() => setSelectedParking(null)}
      />
    );
  }

  return (
    <View className="gap-2">
      <Header title={t('parking-info.title')} />
      <ParkingList onSelect={setSelectedParking} />
    </View>
  );
}
