import React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { type APIResponse } from '@/api';
import { type StateEntity } from '@/api/control-fee';
import { Text } from '@/components/ui';
import { secondary } from '@/components/ui/colors';

interface Props {
  data?: APIResponse<StateEntity[]>;
}

export function WeeksBar({ data }: Props) {
  const { width } = useWindowDimensions();
  return (
    <BarChart
      isAnimated
      animationDuration={1000}
      barWidth={
        ((Platform.OS === 'web' ? 500 : width) - 200) /
        (data?.data?.length ?? 1)
      }
      barBorderRadius={5}
      maxValue={20}
      frontColor={secondary}
      data={data?.data?.map((item) => ({
        ...item,
        topLabelComponent: () => (
          <Text className="rounded-full bg-white p-2 text-xxs text-secondary">
            {item.value}
          </Text>
        ),
        labelComponent: () => (
          <View className="-mt-52 h-20 rotate-90 items-center justify-center rounded-full text-center ">
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
