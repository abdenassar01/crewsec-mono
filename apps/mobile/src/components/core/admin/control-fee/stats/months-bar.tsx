import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { type APIResponse } from '@/api';
import { type StateEntity } from '@/api/control-fee';
import { secondary } from '@/components/ui/colors';
import { months } from '@/lib';

interface Props {
  data?: APIResponse<StateEntity[]>;
}

export function MonthsBar({ data }: Props) {
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
      data={months.map((month) => {
        const count =
          data?.data?.filter(
            (item) => Number(item?.label?.split('-')[1]) === month.value,
          )[0]?.value ?? 0;
        return {
          value: count,
          label: month.label,
        };
      })}
      yAxisThickness={0}
      xAxisThickness={0}
    />
  );
}
