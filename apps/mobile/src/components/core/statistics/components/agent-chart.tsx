import React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

interface Agent {
  name: string;
  total: number;
  paid: number;
}

interface AgentChartProps {
  data: Agent[];
}

export function AgentChart({ data }: AgentChartProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <Text className="mb-2 text-center text-base font-semibold text-text dark:text-gray-100">
          {t('statistics.by-agent')}
        </Text>
        <Text className="py-8 text-center text-gray-500">
          {t('statistics.no-data')}
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.paid)), 1);
  const barWidth = Math.min(40, Math.max(20, 300 / data.length - 20));

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
      <Text className="mb-3 text-center text-base font-semibold text-text dark:text-gray-100">
        {t('statistics.by-agent')}
      </Text>
      <View className="min-h-[200px] w-full items-center">
        <BarChart
          isAnimated
          animationDuration={800}
          data={data.map((item) => ({
            value: item.total,
            label: item.name.split(' ')[0],
            topLabelComponent: () => (
              <Text className="text-[10px] text-gray-500">{item.total}</Text>
            ),
          }))}
          barWidth={barWidth}
          barBorderRadius={4}
          maxValue={maxValue + Math.ceil(maxValue * 0.1)}
          frontColor="#f59e0b"
          yAxisThickness={0}
          xAxisThickness={0}
          spacing={barWidth / 2}
          initialSpacing={10}
          height={200}
        />
      </View>
      <View className="mt-3 flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1">
          <View className="size-2.5 rounded-full bg-amber-500" />
          <Text className="text-[10px] text-gray-500">{t('statistics.total')}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="size-2.5 rounded-full bg-green-500" />
          <Text className="text-[10px] text-gray-500">{t('statistics.paid')}</Text>
        </View>
      </View>
    </View>
  );
}
