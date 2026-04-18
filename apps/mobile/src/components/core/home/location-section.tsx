import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Platform, View } from 'react-native';

import { ActivityIndicator } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { extractCoordinates } from '@/lib';

import { LocationButton } from './location-button';
import { LocationMapView } from './location-map-view';

export function LocationSection() {
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const parkingData = useSafeQuery(api.parkings.getMyParking);
  const parking = parkingData?.parking;

  const [coordinates, setCoordinates] = useState<
    { longitude: number; latitude: number } | undefined
  >(undefined);

  useEffect(() => {
    if (parking?.location) {
      extractCoordinates(parking.location)
        .then((res) => {
          if (res) setCoordinates(res);
        })
        .catch((error) => {
          console.error('Failed to extract coordinates:', error);
        });
    }
  }, [parking?.location]);

  const handleLocationPress = () => {
    if (Platform.OS === 'ios' && coordinates) {
      push(parking?.location || 'https://crewsec.se');
    } else {
      push(parking?.location || 'https://crewsec.se');
    }
  };

  return (
    <>
      <LocationButton onPress={handleLocationPress} />
      <View className="aspect-square w-full overflow-hidden rounded-xl">
        {Platform.OS !== 'web' && !parking ? (
          <ActivityIndicator size={50} />
        ) : (
          <LocationMapView
            coordinates={coordinates}
            showsUserLocation={false}
          />
        )}
      </View>
    </>
  );
}
