import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform } from 'react-native';

export const useLocationNavigation = (
  coordinates: { longitude: number; latitude: number } | undefined,
) => {
  const { t } = useTranslation();

  const openMaps = () => {
    if (!coordinates) return;

    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=Current+Location`
        : `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  };

  const handleLocationPress = () => {
    if (!coordinates) return;
    Alert.alert(t('home.location'), 'Open in maps app?', [
      { text: 'Open', onPress: openMaps },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return { handleLocationPress, openMaps };
};
