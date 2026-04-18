/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import { ClientEnv, Env } from './env';

export default ({ config }: ConfigContext): ExpoConfig => {
  const myConfig: ExpoConfig = {
    ...config,
    name: Env.NAME,
    description: `${Env.NAME} Mobile App`,
    owner: Env.EXPO_ACCOUNT_OWNER,
    scheme: Env.SCHEME,
    slug: 'crewsec',
    version: Env.VERSION.toString(),
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: Env.BUNDLE_ID,
      infoPlist: {
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'This app requires access to your location when open.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'This app requires access to your location even when closed.',
        NSLocationAlwaysUsageDescription:
          'This app requires access to your location when open.',
      },
      config: {
        googleMapsApiKey: Env.MAP_API_KEY,
      },
    },
    experiments: {
      typedRoutes: true,
    },
    android: {
      googleServicesFile: './firebase/google-services.json',
      config: {
        googleMaps: {
          apiKey: Env.MAP_API_KEY,
        },
      },
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2E3C4B',
      },
      package: Env.PACKAGE,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
        'android.permission.BLUETOOTH',
        'android.permission.BLUETOOTH_ADMIN',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'single',
      config: {},
    },
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission:
            'The app accesses your photos to let you share them with your friends.',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
          android: {
            targetSdkVersion: 36,
            compileSdkVersion: 36,
            ndkVersion: '28.0.12433566',
            enable16KBPageSize: true,
          },
        },
      ],
      [
        'react-native-ble-plx',
        {
          isBackgroundEnabled: true,
          modes: ['peripheral', 'central'],
          bluetoothAlwaysPermission:
            'Allow $(PRODUCT_NAME) to connect to bluetooth devices',
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
          image: './assets/splash-icon.png',
          dark: {
            image: './assets/dark-splash-icon.png',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/SF_Pro_Display.ttf',
            './assets/fonts/AtkinsonHyperlegible.ttf',
          ],
        },
      ],
      'expo-localization',
      'expo-router',
      'expo-secure-store',
      'expo-web-browser',
      ['react-native-edge-to-edge'],
    ],
    extra: {
      ...ClientEnv,
      eas: {
        projectId: Env.EAS_PROJECT_ID,
      },
    },
  };

  return myConfig;
};
