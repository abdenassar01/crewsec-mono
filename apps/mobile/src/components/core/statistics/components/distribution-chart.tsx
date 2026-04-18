import React from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

const COLORS: Record<string, string> = {
  paid: '#10b981',
  unpaid: '#f59e0b',
  canceled: '#ef4444',
  conflict: '#8b5cf6',
};

interface DistributionChartProps {
  total: number;
  paid: number;
  unpaid: number;
  canceled: number;
  conflict: number;
}

export function DistributionChart({
  total,
  paid,
  unpaid,
  canceled,
  conflict,
}: DistributionChartProps) {
  const { t } = useTranslation();

  const items = [
    { key: 'paid', label: t('statistics.paid'), value: paid },
    { key: 'unpaid', label: t('statistics.awaiting'), value: unpaid },
    { key: 'canceled', label: t('statistics.canceled'), value: canceled },
    { key: 'conflict', label: t('statistics.conflict'), value: conflict },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <Text className="mb-2 text-center text-base font-semibold text-text dark:text-gray-100">
          {t('statistics.status-breakdown')}
        </Text>
        <Text className="py-8 text-center text-gray-500">
          {t('statistics.no-data')}
        </Text>
      </View>
    );
  }

  const pieData = items.map((item) => ({
    value: item.value,
    color: COLORS[item.key],
    label: item.label,
  }));

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
      <Text className="mb-4 text-center text-base font-semibold text-text dark:text-gray-100">
        {t('statistics.status-breakdown')}
      </Text>
      <View className="items-center">
        <PieChart
          data={pieData}
          radius={90}
          donut
          showText
          textColor="#0F1117"
          textSize={11}
          strokeWidth={12}
          strokeColor="#FFFFFF"
          showTextBackground
          textBackgroundColor="#FFFFFF"
          textBackgroundRadius={20}
          labelsPosition="onBorder"
        />
      </View>
      <View className="mt-4 flex-row flex-wrap justify-center gap-4">
        {items.map((item) => (
          <View key={item.key} className="items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {item.label}
            </Text>
            <Text
              className="text-xl font-bold"
              style={{ color: COLORS[item.key] }}
            >
              {item.value}
            </Text>
            <Text className="text-[10px] text-gray-400">
              {((item.value / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
