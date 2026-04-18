/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
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
import { extractCoordinates } from '@/lib';

const useLocationNavigation = (
  coordinates: { longitude: number; latitude: number } | undefined,
  parkingLocation: string | undefined,
  push: any,
) => {
  const { t } = useTranslation();

  const openAppleMaps = () => {
    if (coordinates) {
      const url = `http://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=Location`;
      Linking.openURL(url).catch((err) => {
        console.error('Failed to open Apple Maps:', err);
        openThirdPartyMaps();
      });
    }
  };

  const openThirdPartyMaps = () => {
    //@ts-ignore
    push(parkingLocation || 'https://crewsec.se');
  };

  const handleLocationPress = () => {
    if (Platform.OS === 'ios' && coordinates) {
      Alert.alert(t('home.location'), 'Choose how to open the location:', [
        { text: 'Apple Maps', onPress: openAppleMaps },
        { text: 'Other Maps', onPress: openThirdPartyMaps },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      openThirdPartyMaps();
    }
  };

  return { handleLocationPress };
};

export function LocationSection() {
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const parkingData = useSafeQuery(api.parkings.getMyParking);
  const parking = parkingData?.parking;

  const [coordinates, setCoordinates] = useState<
    { longitude: number; latitude: number } | undefined
  >(undefined);

  const { handleLocationPress } = useLocationNavigation(
    coordinates,
    parking?.location || '',
    push,
  );

  useEffect(() => {
    if (parking?.location) {
      extractCoordinates(parking.location)
        .then((res) => {
          if (res) {
            setCoordinates(res);
          }
        })
        .catch((error) => {
          console.error('Failed to extract coordinates:', error);
        });
    }
  }, [parking?.location]);

  return (
    <>
      <TouchableOpacity
        onPress={handleLocationPress}
        className="my-3 w-full flex-row items-center justify-center gap-2 rounded-xl bg-secondary p-3 dark:bg-primary"
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
      <View className="aspect-square w-full overflow-hidden rounded-xl">
        {Platform.OS !== 'web' && !parking ? (
          <ActivityIndicator size={50} />
        ) : (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 59.27104971010331,
              longitude: 17.95408638834324,
              latitudeDelta: 1,
              longitudeDelta: 1,
            }}
          >
            {coordinates && (
              <Marker
                coordinate={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }}
              />
            )}
          </MapView>
        )}
      </View>
    </>
  );
}
