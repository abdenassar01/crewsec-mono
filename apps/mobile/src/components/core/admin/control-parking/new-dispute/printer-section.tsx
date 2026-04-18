/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { type Control, useController } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import {
  BLEPrinter,
  type IBLEPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';

import { cn, useBluetoothStatus } from '@/lib';

interface Props {
  control: Control<any>;
}

export function PrinterSection({ control }: Props) {
  const [devices, setDevices] = React.useState<IBLEPrinter[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { requestBluetoothPermissions } = useBluetoothStatus();

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name: 'device' });

  useEffect(() => {
    requestBluetoothPermissions();
  }, []);

  const scan = () => {
    setLoading(true);
    console.log('REF: ', value);
    BLEPrinter.init()
      .then(() => {
        return BLEPrinter.getDeviceList();
      })
      .then((_devices) => {
        console.log('Devices found: ', _devices);
        setDevices(_devices);

        setLoading(false);
      })
      .catch((err) => {
        console.log('EER: ', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    scan();
  }, []);

  return (
    <View className="my-3 rounded-xl border border-dashed border-success-500 bg-background-secondary p-2 dark:bg-background-secondary-dark">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className=" font-bold text-secondary">Devices</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="mt-2 items-center justify-center rounded-full bg-secondary  p-2 px-5"
            onPress={scan}
          >
            <Text className="text-white dark:text-background-secondaryDark">
              Scan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {loading ? (
          <ActivityIndicator />
        ) : devices.length === 0 ? (
          <Text className="text-secondary">No devices found</Text>
        ) : (
          devices.map((item) => (
            <TouchableOpacity
              key={item?.inner_mac_address}
              className={cn(
                'rounded p-2 px-5',
                value?.inner_mac_address === item.inner_mac_address
                  ? 'bg-success-600/10'
                  : 'bg-secondary/10 ',
              )}
              onPress={() => {
                setLoading(true);
                BLEPrinter.connectPrinter(item?.inner_mac_address)
                  .then((printer) => {
                    console.log('Connected to printer: ', printer);
                    onChange(printer);
                    showMessage({
                      message: `Connected to ${printer.device_name}`,
                      type: 'success',
                    });

                    setLoading(false);
                  })
                  .catch((err) => {
                    showMessage({
                      message: `Connection failed: ${err.message || JSON.stringify(err)}`,
                      type: 'danger',
                    });
                    console.log('Error: ', JSON.stringify(err));
                    setLoading(false);
                  });
              }}
            >
              <Text
                className={cn(
                  'text-center text-secondary',
                  value?.inner_mac_address === item.inner_mac_address
                    ? 'text-success-600'
                    : 'text-secondary',
                )}
              >
                {item.device_name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {error && (
        <Text className="text-sm text-danger-600">{error?.message}</Text>
      )}
    </View>
  );
}
