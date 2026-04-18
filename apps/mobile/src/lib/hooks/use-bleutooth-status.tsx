/* eslint-disable max-lines-per-function */
import { useState } from 'react';

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

  return {
    bluetoothState,
    isBluetoothEnabled: bluetoothState === 'PoweredOn',
    hasBluetoothPermissions,
    requestBluetoothPermissions: () =>
      console.log('Bleutouth is not allowed on web'),
  };
};
