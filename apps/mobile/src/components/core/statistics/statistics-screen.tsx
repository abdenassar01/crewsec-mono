/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { DateRangeSelector, Header } from '@/components/common';
import { ActivityIndicator, ScrollView, Text } from '@/components/ui';
import { colors } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

function formatWeekLabel(label: string, t: (key: string) => string): string {
  // Format: YYYY-Www (e.g., "2025-W01")
  const match = label.match(/(\d{4})-W(\d{2})/);
  if (match) {
    const year = match[1];
    const week = parseInt(match[2], 10);
    return `${t('statistics.week')} ${week} (${year})`;
  }
  return label;
}

type StatPeriod = 'day' | 'week' | 'month';

const statTabs: StatPeriod[] = ['day', 'week', 'month'];

interface ChartCardProps {
  title: string;
  color: string;
  chartData: { label: string; value: number }[] | null | undefined;
  selectedTab: StatPeriod;
  width: number;
  totalLabel: string;
}

function ChartCard({
  title,
  color,
  chartData,
  selectedTab,
  width,
  totalLabel,
}: ChartCardProps) {
  const { t } = useTranslation();

  if (!chartData || chartData.length === 0) {
    return (
      <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <Text className="mb-2 text-center text-base font-semibold text-text dark:text-gray-100">
          {title}
        </Text>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500 text-center">
            {t('statistics.no-data')}
          </Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const chartWidth = Platform.OS === 'web' ? 500 : width;
  const dataLength = chartData.length || 1;
  const barWidth = Math.max(20, (chartWidth - 150) / dataLength - 10);

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
      <Text className="mb-3 text-center text-base font-semibold text-text dark:text-gray-100">
        {title}
      </Text>
      <View className="min-h-[200px] w-full items-center">
        {selectedTab === 'day' ? (
          <LineChart
            isAnimated
            animationDuration={1000}
            maxValue={maxValue + Math.ceil(maxValue * 0.1)}
            data={chartData.map((item) => ({
              value: item.value,
              label: moment(item.label).format('DD/MM'),
            }))}
            yAxisThickness={0}
            xAxisThickness={0}
            spacing={barWidth}
            initialSpacing={10}
            width={Dimensions.get('screen').width - 130}
            color={color}
            thickness={3}
            dataPointsRadius={5}
            dataPointsColor={color}
            showValuesAsDataPointsText
            height={200}
          />
        ) : (
          <BarChart
            isAnimated
            animationDuration={1000}
            barWidth={Math.min(barWidth, 40)}
            barBorderRadius={5}
            maxValue={maxValue + Math.ceil(maxValue * 0.1)}
            frontColor={color}
            data={chartData.map((item) => ({
              value: item.value,
              label:
                selectedTab === 'week'
                  ? formatWeekLabel(item.label, t)
                  : moment(item.label).format('MM/YY'),
              topLabelComponent: () => (
                <View className="items-center">
                  <Text className="rounded-full bg-white px-2 py-0.5 text-[10px] text-secondary dark:text-secondary">
                    {item.value}
                  </Text>
                </View>
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
      <View className="mt-3 items-center">
        <Text
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {totalLabel}: {chartData.reduce((acc, item) => acc + item.value, 0)}
        </Text>
      </View>
    </View>
  );
}

export function StatisticsScreen() {
  const { t } = useTranslation();
  const { control, watch } = useForm();
  const { width } = useWindowDimensions();

  const [selectedTab, setSelectedTab] = useState<StatPeriod>('day');

  const dateRange = watch('dateRange') as string[] | undefined;

  const { startDate, endDate } = useMemo(() => {
    const end = dateRange?.[dateRange.length - 1]
      ? moment(dateRange[dateRange.length - 1])
          .endOf('day')
          .valueOf()
      : moment().valueOf();

    const start = dateRange?.[0]
      ? moment(dateRange[0]).valueOf()
      : moment(end).subtract(30, 'days').valueOf();

    return { startDate: start, endDate: end };
  }, [dateRange]);

  const totalStats = useSafeQuery(api.statistics.getControlFeeStats, {
    startDate,
    endDate,
    groupBy: selectedTab,
  });

  const paidStats = useSafeQuery(api.statistics.getControlFeeStatsByStatus, {
    startDate,
    endDate,
    groupBy: selectedTab,
    status: 'PAID',
  });

  const conflictStats = useSafeQuery(
    api.statistics.getControlFeeStatsByStatus,
    {
      startDate,
      endDate,
      groupBy: selectedTab,
      status: 'CONFLICT',
    },
  );

  const canceledStats = useSafeQuery(
    api.statistics.getControlFeeStatsByStatus,
    {
      startDate,
      endDate,
      groupBy: selectedTab,
      status: 'CANCELED',
    },
  );

  const statusData = useSafeQuery(api.statistics.getControlFeeByStatus, {
    startDate,
    endDate,
  });

  const pieData = statusData
    ? [
        {
          value: statusData.AWAITING || 0,
          color: '#f59e0b',
          label: t('statistics.awaiting'),
        },
        {
          value: statusData.PAID || 0,
          color: '#10b981',
          label: t('statistics.paid'),
        },
        {
          value: statusData.CANCELED || 0,
          color: '#ef4444',
          label: t('statistics.canceled'),
        },
        {
          value: statusData.CONFLICT || 0,
          color: '#8b5cf6',
          label: t('statistics.conflict'),
        },
      ].filter((d) => d.value > 0)
    : [];

  const isLoading =
    !statusData ||
    !totalStats ||
    !paidStats ||
    !conflictStats ||
    !canceledStats;

  if (isLoading) {
    return (
      <View className="">
        <Header title={t('statistics.title')} />
        <View className="items-center justify-center pt-20">
          <ActivityIndicator size={40} color={colors.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View className="container pt-3">
      <Header title={t('statistics.title')} />
      <ScrollView
        className="container mt-4"
        contentContainerClassName="gap-2 pb-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <DateRangeSelector control={control} />

        {/* Period Selector */}
        <View className="flex-row justify-between rounded-full bg-white p-1 dark:bg-background-secondary-dark">
          {statTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={cn(
                'flex-1 rounded-full py-2',
                selectedTab === tab ? 'bg-secondary' : '',
              )}
            >
              <Text
                className={cn(
                  'text-center text-xs font-medium capitalize',
                  selectedTab === tab
                    ? 'text-white dark:text-backgroundDark'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                {t(`statistics.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View className="mt-4 flex-row flex-wrap gap-3">
          <View className="min-w-[140px] flex-1 rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
            <Text className="text-2xl font-bold text-secondary">
              {statusData.total || 0}
            </Text>
            <Text className="text-gray-500 text-xs">
              {t('statistics.total-control-fees')}
            </Text>
          </View>
          <View className="min-w-[140px] flex-1 rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
            <Text className="text-2xl font-bold text-green-500">
              {statusData.PAID || 0}
            </Text>
            <Text className="text-gray-500 text-xs">
              {t('statistics.paid')}
            </Text>
          </View>
          <View className="min-w-[140px] flex-1 rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
            <Text className="text-2xl font-bold text-orange-500">
              {statusData.AWAITING || 0}
            </Text>
            <Text className="text-gray-500 text-xs">
              {t('statistics.awaiting')}
            </Text>
          </View>
        </View>

        {/* Charts */}
        <ChartCard
          title={t('statistics.total-control-fees')}
          color={colors.secondary}
          chartData={totalStats}
          selectedTab={selectedTab}
          width={width}
          totalLabel={t('statistics.total')}
        />

        <ChartCard
          title={t('statistics.paid')}
          color="#10b981"
          chartData={paidStats}
          selectedTab={selectedTab}
          width={width}
          totalLabel={t('statistics.total')}
        />

        <ChartCard
          title={t('statistics.conflict')}
          color="#8b5cf6"
          chartData={conflictStats}
          selectedTab={selectedTab}
          width={width}
          totalLabel={t('statistics.total')}
        />

        <ChartCard
          title={t('statistics.canceled')}
          color="#ef4444"
          chartData={canceledStats}
          selectedTab={selectedTab}
          width={width}
          totalLabel={t('statistics.total')}
        />

        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <View className="mt-6 rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
            <Text className="mb-4 text-center text-base font-semibold text-text dark:text-gray-100">
              {t('statistics.by-status')}
            </Text>
            <View className="items-center">
              <PieChart
                data={pieData}
                radius={100}
                donut
                showText
                textColor="#0F1117"
                textSize={11}
                strokeWidth={15}
                strokeColor="#FFFFFF"
                showTextBackground
                textBackgroundColor="#FFFFFF"
                textBackgroundRadius={22}
                labelsPosition="onBorder"
              />
            </View>
            <View className="mt-6 flex-row flex-wrap justify-center gap-4">
              {pieData.map((item) => (
                <View key={item.label} className="flex-row items-center gap-2">
                  <View
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-gray-600 dark:text-gray-400 text-xs">
                    {item.label}: {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="mt-6 items-center justify-center rounded-xl bg-white p-8 dark:bg-background-secondary-dark">
            <Text className="text-gray-500 text-center">
              {t('statistics.no-data')}
            </Text>
          </View>
        )}

        {/* Status Breakdown */}
        <View className="my-6 rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
          <Text className="mb-4 text-center text-base font-semibold text-text dark:text-gray-100">
            {t('statistics.status-breakdown')}
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between rounded-lg bg-green-500/10 p-3">
              <Text className="text-sm font-medium text-green-600">
                {t('statistics.paid')}
              </Text>
              <Text className="text-lg font-bold text-green-600">
                {statusData.PAID || 0}
              </Text>
            </View>
            <View className="flex-row items-center justify-between rounded-lg bg-orange-500/10 p-3">
              <Text className="text-sm font-medium text-orange-600">
                {t('statistics.awaiting')}
              </Text>
              <Text className="text-lg font-bold text-orange-600">
                {statusData.AWAITING || 0}
              </Text>
            </View>
            <View className="flex-row items-center justify-between rounded-lg bg-red-500/10 p-3">
              <Text className="text-sm font-medium text-red-600">
                {t('statistics.canceled')}
              </Text>
              <Text className="text-lg font-bold text-red-600">
                {statusData.CANCELED || 0}
              </Text>
            </View>
            {(statusData.CONFLICT || 0) > 0 && (
              <View className="flex-row items-center justify-between rounded-lg bg-purple-500/10 p-3">
                <Text className="text-sm font-medium text-purple-600">
                  {t('statistics.conflict')}
                </Text>
                <Text className="text-lg font-bold text-purple-600">
                  {statusData.CONFLICT || 0}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
