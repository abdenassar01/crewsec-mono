/* eslint-disable max-lines-per-function */
import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { Text } from '@/components/ui';
import { useGeolocation } from '@/lib/hooks/use-geolocation';

const useLocationNavigation = (
  coordinates: { longitude: number; latitude: number } | undefined,
) => {
  const { t } = useTranslation();

  const openMaps = () => {
    if (coordinates) {
      if (Platform.OS === 'ios') {
        const url = `http://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=Current+Location`;
        Linking.openURL(url).catch((err) => {
          console.error('Failed to open Apple Maps:', err);
        });
      } else {
        const url = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
        Linking.openURL(url).catch((err) => {
          console.error('Failed to open Google Maps:', err);
        });
      }
    }
  };

  const handleLocationPress = () => {
    if (coordinates) {
      Alert.alert(t('home.location'), 'Open in maps app?', [
        { text: 'Open', onPress: openMaps },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return { handleLocationPress };
};

export function CurrentLocationSection() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { location, isLoading, error, requestLocation } = useGeolocation();

  const coordinates = useMemo(() => {
    if (location.latitude !== null && location.longitude !== null) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
    return undefined;
  }, [location]);

  const { handleLocationPress } = useLocationNavigation(coordinates);

  const mapRegion = useMemo(() => {
    if (coordinates) {
      return {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: 59.27104971010331,
      longitude: 17.95408638834324,
      latitudeDelta: 1,
      longitudeDelta: 1,
    };
  }, [coordinates]);

  return (
    <>
      <TouchableOpacity
        onPress={handleLocationPress}
        className="my-2 w-full flex-row items-center justify-center gap-2 rounded-xl bg-secondary p-3 dark:bg-primary"
      >
        <Image
          className="aspect-square w-7"
          source={
            colorScheme === 'dark'
              ? require('assets/icons/dark/location.png')
              : require('assets/icons/light/location.png')
          }
        />
        <Text className="text-textdark dark:text-text">
          {t('home.location')}
        </Text>
      </TouchableOpacity>
      <View className="aspect-square w-full overflow-hidden rounded-xl mb-16">
        {Platform.OS !== 'web' && isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={50} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-center text-textdark dark:text-text">
              {error}
            </Text>
            <TouchableOpacity
              onPress={requestLocation}
              className="mt-4 rounded-lg bg-primary px-4 py-2 dark:bg-secondary"
            >
              <Text className="text-text dark:text-gray-100">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            region={mapRegion}
            showsUserLocation
            followsUserLocation
          >
            {coordinates && (
              <Marker
                coordinate={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }}
                title="Your Location"
              />
            )}
          </MapView>
        )}
      </View>
    </>
  );
}
