import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { type APIResponse } from '@/api';
import { type StateEntity } from '@/api/control-fee';
import { Text } from '@/components/ui';

interface Props {
  data?: APIResponse<StateEntity[]>;
}

export function DaysBar({ data }: Props) {
  return (
    <LineChart
      isAnimated
      animationDuration={1000}
      maxValue={20}
      data={data?.data?.map((item) => ({
        ...item,
        secondaryLabelComponent: () => (
          <Text className="-mt-2 rounded-full bg-white p-2 text-xxs text-secondary">
            {item.label}
          </Text>
        ),
        labelComponent: () => (
          <View className="-ml-9 -mt-44 w-28 rotate-90 items-center justify-center rounded-full text-center ">
            <Text className="bg-white p-1 !text-xxs text-secondary">
              {item.label}
            </Text>
          </View>
        ),
      }))}
      yAxisThickness={0}
      xAxisThickness={0}
    />
  );
}
