/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { type Control, useController } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import {
  BLEPrinter,
  type IBLEPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';

import { cn } from '@/lib';

interface Props {
  control: Control<any>;
}

export function VehicleControlStepFour({ control }: Props) {
  const [devices, setDevices] = React.useState<IBLEPrinter[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name: 'device' });

  useEffect(() => {
    setLoading(true);
    BLEPrinter.init().then(() => {
      BLEPrinter.getDeviceList()
        .then((_devices) => {
          setDevices(_devices);
          setLoading(false);
        })
        .catch(() => {});
    });
  }, []);

  function scan() {
    setLoading(true);
    BLEPrinter.getDeviceList()
      .then((devices) => {
        setDevices(devices);
        setLoading(false);
      })
      .catch((err) => Alert.alert('EER: ', JSON.stringify(err)));
  }

  return (
    <View className="mt-3">
      <View className="my-2 flex-row items-center justify-between">
        <Text className=" font-bold text-secondary">Devices</Text>
        <TouchableOpacity
          className="mt-5 items-center justify-center rounded-full bg-secondary  p-2 px-5"
          onPress={scan}
        >
          <Text className="text-white dark:bg-background-secondary-dark">
            Scan
          </Text>
        </TouchableOpacity>
      </View>
      <View className=" flex-row gap-2">
        {loading ? (
          <ActivityIndicator />
        ) : (
          devices.map((item) => (
            <TouchableOpacity
              key={item?.inner_mac_address}
              className={cn(
                'w-[49%] rounded border p-2 px-5',
                value?.inner_mac_address === item.inner_mac_address
                  ? 'border-success-600'
                  : 'border-secondary ',
              )}
              onPress={() => {
                BLEPrinter.connectPrinter(item?.inner_mac_address)
                  .then(onChange)
                  .catch((err) => {
                    showMessage({
                      message: err.message,
                      type: 'danger',
                    });
                  });
              }}
            >
              <Text className="text-center text-secondary">
                {item.device_name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <Text className="text-sm text-danger-600">{error?.message}</Text>
    </View>
  );
}
