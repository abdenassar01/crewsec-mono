import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, View } from 'react-native';

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
  // const parking = useAuth.use.parking();

  const [coordinates, setCoordinates] = useState<
    { longitude: number; latitude: number } | undefined
  >(undefined);

  // const { handleLocationPress } = useLocationNavigation(
  //   coordinates,
  //   parking?.location || '',
  //   push,
  // );

  // useEffect(() => {
  //   extractCoordinates(parking?.location || '').then((res) => {
  //     setCoordinates(res);
  //   });
  // }, []);

  return (
    <>
      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
      <View className="aspect-square w-full overflow-hidden rounded-xl web:hidden">
        Maps not available for web
      </View>
    </>
  );
}
