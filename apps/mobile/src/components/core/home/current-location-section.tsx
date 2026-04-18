import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { useGeolocation } from '@/lib/hooks/use-geolocation';

import { LocationButton } from './location-button';
import { LocationErrorView } from './location-error-view';
import { LocationMapView } from './location-map-view';
import { useLocationNavigation } from './use-location-navigation';

export function CurrentLocationSection() {
  const { location, isLoading, error, requestLocation } = useGeolocation();

  const coordinates = useMemo(() => {
    if (location.latitude !== null && location.longitude !== null) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return undefined;
  }, [location]);

  const { handleLocationPress } = useLocationNavigation(coordinates);

  return (
    <>
      <LocationButton onPress={handleLocationPress} />
      <View className="aspect-square w-full overflow-hidden rounded-xl mb-16">
        {Platform.OS !== 'web' && isLoading ? (
          <LocationErrorView
            isLoading={isLoading}
            error={null}
            onRetry={requestLocation}
          />
        ) : error ? (
          <LocationErrorView
            isLoading={false}
            error={error}
            onRetry={requestLocation}
          />
        ) : (
          <LocationMapView coordinates={coordinates} title="Your Location" />
        )}
        <View className="h-24" />
      </View>
    </>
  );
}
