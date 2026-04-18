import moment from 'moment';
import React from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

function formatWeekLabel(label: string, t: (key: string) => string): string {
  const match = label.match(/(\d{4})-W(\d{2})/);
  if (match) {
    return `${t('statistics.week')} ${parseInt(match[2], 10)}`;
  }
  return label;
}

type StatPeriod = 'day' | 'week' | 'month';

interface TrendChartProps {
  data: { label: string; value: number }[] | null | undefined;
  title: string;
  color: string;
  period: StatPeriod;
}

export function TrendChart({ data, title, color, period }: TrendChartProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <Text className="mb-2 text-center text-base font-semibold text-text dark:text-gray-100">
          {title}
        </Text>
        <Text className="py-8 text-center text-gray-500">
          {t('statistics.no-data')}
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = Platform.OS === 'web' ? 500 : Dimensions.get('screen').width - 80;
  const dataLength = data.length || 1;
  const barWidth = Math.max(16, (chartWidth - 100) / dataLength - 10);
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
      <Text className="mb-3 text-center text-base font-semibold text-text dark:text-gray-100">
        {title}
      </Text>
      <View className="min-h-[200px] w-full items-center">
        {period === 'day' ? (
          <LineChart
            isAnimated
            animationDuration={800}
            maxValue={maxValue + Math.ceil(maxValue * 0.1)}
            data={data.map((item) => ({
              value: item.value,
              label: moment(item.label).format('DD/MM'),
            }))}
            yAxisThickness={0}
            xAxisThickness={0}
            spacing={barWidth}
            initialSpacing={10}
            width={chartWidth - 100}
            color={color}
            thickness={3}
            dataPointsRadius={4}
            dataPointsColor={color}
            showValuesAsDataPointsText
            height={200}
          />
        ) : (
          <BarChart
            isAnimated
            animationDuration={800}
            barWidth={Math.min(barWidth, 40)}
            barBorderRadius={4}
            maxValue={maxValue + Math.ceil(maxValue * 0.1)}
            frontColor={color}
            data={data.map((item) => ({
              value: item.value,
              label:
                period === 'week'
                  ? formatWeekLabel(item.label, t)
                  : moment(item.label).format('MM/YY'),
              topLabelComponent: () => (
                <Text className="text-[10px] text-gray-500">{item.value}</Text>
              ),
            }))}
            yAxisThickness={0}
            xAxisThickness={0}
            spacing={barWidth / 2}
            initialSpacing={10}
            height={200}
          />
        )}
      </View>
      <View className="mt-2 items-center">
        <Text
          className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {t('statistics.total')}: {total}
        </Text>
      </View>
    </View>
  );
}
