import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { Header, RootWrapper } from '@/components/common';
import { FelparkeringByParkingList, ParkingsList } from '@/components/core';
import { Image, Text } from '@/components/ui';
import { cn } from '@/lib';

export default function ManageFelparkerings() {
  const { t } = useTranslation();
  const [selectedParking, setSelectedParking] = useState<
    Id<'parkings'> | undefined
  >(undefined);

  return (
    <RootWrapper className="container">
      <Header title={t('admin.felparkering')} />
      <View className="mt-2">
        <View className={cn('flex-row justify-start')}>
          {selectedParking && (
            <TouchableOpacity
              onPress={() => {
                setSelectedParking(undefined);
              }}
              className={cn(
                'items-center gap-2 rounded-lg bg-secondary/10 p-2 px-4 flex-row-reverse',
              )}
            >
              <Text className="text-xs text-secondary">{t('forms.prev')}</Text>
              <Image
                source={require('assets/icons/light/back.png')}
                className={cn('size-5')}
              />
            </TouchableOpacity>
          )}
        </View>
        {selectedParking ? (
          <FelparkeringByParkingList id={selectedParking} />
        ) : (
          <ParkingsList
            resource="felparkering"
            setSelectedParking={setSelectedParking}
            selected={selectedParking}
          />
        )}
      </View>
    </RootWrapper>
  );
}
