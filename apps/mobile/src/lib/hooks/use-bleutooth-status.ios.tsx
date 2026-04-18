/* eslint-disable max-lines-per-function */
import { useState } from 'react';

/**
 * @typedef {'Unknown' | 'Resetting' | 'Unsupported' | 'Unauthorized' | 'PoweredOff' | 'PoweredOn'} BluetoothState
 */

/**
 * Custom React Hook for checking and managing Bluetooth status and permissions on iOS.
 * This version is disabled for iOS to avoid requesting Bluetooth permissions.
 *
 * @returns {{
 *   bluetoothState: BluetoothState;
 *   isBluetoothEnabled: boolean;
 *   hasBluetoothPermissions: boolean;
 *   requestBluetoothPermissions: () => Promise<boolean>;
 * }}
 */
export const useBluetoothStatus = () => {
  const [bluetoothState] = useState(
    /** @type {BluetoothState} */ 'Unsupported',
  );
  const [hasBluetoothPermissions] = useState(false);

  const requestBluetoothPermissions = async () => {
    console.log('Bluetooth functionality is disabled on iOS');
    return false;
  };

  return {
    bluetoothState,
    isBluetoothEnabled: false,
    hasBluetoothPermissions,
    requestBluetoothPermissions,
  };
};