/* eslint-disable max-lines-per-function */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

/**
 * @typedef {'Unknown' | 'Resetting' | 'Unsupported' | 'Unauthorized' | 'PoweredOff' | 'PoweredOn'} BluetoothState
 */

/**
 * Custom React Hook for checking and managing Bluetooth status and permissions.
 *
 * @returns {{
 *   bluetoothState: BluetoothState;
 *   isBluetoothEnabled: boolean;
 *   hasBluetoothPermissions: boolean;
 *   requestBluetoothPermissions: () => Promise<boolean>;
 * }}
 */
export const useBluetoothStatus = () => {
  const [bluetoothState, setBluetoothState] = useState(
    /** @type {BluetoothState} */ 'Unknown',
  );
  const [hasBluetoothPermissions, setHasBluetoothPermissions] = useState(false);
  const isMounted = useRef(true); // To prevent state updates on unmounted component

  // Callback to request necessary Bluetooth permissions
  const requestBluetoothPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const grantedLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission for Bluetooth',
            message:
              'Bluetooth scanning and functionality require location access.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        let allPermissionsGranted =
          grantedLocation === PermissionsAndroid.RESULTS.GRANTED;

        if (Platform.Version >= 31) {
          // Android 12 (API 31) and above require new Bluetooth permissions
          const grantedBluetoothScan = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: 'Bluetooth Scan Permission',
              message:
                'App needs Bluetooth Scan permission to discover devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          const grantedBluetoothConnect = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: 'Bluetooth Connect Permission',
              message:
                'App needs Bluetooth Connect permission to pair with devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          // For advertising, if needed
          // const grantedBluetoothAdvertise = await PermissionsAndroid.request(
          //   PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          //   {
          //     title: 'Bluetooth Advertise Permission',
          //     message: 'App needs Bluetooth Advertise permission to function as a peripheral.',
          //     buttonNeutral: 'Ask Me Later',
          //     buttonNegative: 'Cancel',
          //     buttonPositive: 'OK',
          //   }
          // );

          allPermissionsGranted =
            allPermissionsGranted &&
            grantedBluetoothScan === PermissionsAndroid.RESULTS.GRANTED &&
            grantedBluetoothConnect === PermissionsAndroid.RESULTS.GRANTED;
          // && grantedBluetoothAdvertise === PermissionsAndroid.RESULTS.GRANTED; // Uncomment if needed
        }

        if (isMounted.current) {
          setHasBluetoothPermissions(allPermissionsGranted);
        }
        if (!allPermissionsGranted) {
          Alert.alert(
            'Permissions Denied',
            'Bluetooth functionality will be limited without necessary permissions.',
          );
        }
        return allPermissionsGranted;
      } catch (err) {
        console.warn('Bluetooth permission request error:', err);
        if (isMounted.current) {
          setHasBluetoothPermissions(false);
        }
        return false;
      }
    } else {
      // iOS doesn't have explicit runtime Bluetooth permissions via PermissionsAndroid.
      // Permissions are handled by the system automatically when Bluetooth is first accessed,
      // provided NSBluetoothAlwaysUsageDescription is in Info.plist.
      // We'll consider permissions "granted" if the app attempts to use Bluetooth.
      if (isMounted.current) {
        setHasBluetoothPermissions(true);
      }
      return true;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Check and set initial permissions status
    const checkInitialPermissions = async () => {
      let initialPermissions = false;
      if (Platform.OS === 'android') {
        const hasLocationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        initialPermissions = hasLocationPermission;

        if (Platform.Version >= 31) {
          const hasScanPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          );
          const hasConnectPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          );
          initialPermissions =
            initialPermissions && hasScanPermission && hasConnectPermission;
        }
      } else {
        // For iOS, assume permissions are implicitly granted if the Info.plist entries exist
        initialPermissions = true;
      }
      if (isMounted.current) {
        setHasBluetoothPermissions(initialPermissions);
      }
    };

    checkInitialPermissions();

    // Set up Bluetooth state listener
    const subscription = bleManager.onStateChange((state) => {
      if (isMounted.current) {
        setBluetoothState(state);
      }
    }, true); // `true` makes it emit the current state immediately

    return () => {
      // Cleanup on component unmount
      isMounted.current = false;
      subscription.remove(); // Remove the state change listener
      bleManager.destroy(); // Destroy the BleManager instance
    };
  }, []); // Run once on mount

  return {
    bluetoothState,
    isBluetoothEnabled: bluetoothState === 'PoweredOn',
    hasBluetoothPermissions,
    requestBluetoothPermissions,
  };
};
