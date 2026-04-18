import { api } from 'convex/_generated/api';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { DateRangeSelector, Header, RootWrapper } from '@/components/common';
import { ActivityIndicator, ScrollView, Text, colors } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

import { AgentChart } from './components/agent-chart';
import { DistributionChart } from './components/distribution-chart';
import { StatCard } from './components/stat-card';
import { TrendChart } from './components/trend-chart';

type StatPeriod = 'day' | 'week' | 'month';

const statTabs: StatPeriod[] = ['day', 'week', 'month'];

const PRESETS = [
  { key: '7d', days: 7 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
] as const;

export function StatisticsScreen() {
  const { t } = useTranslation();
  const { control, setValue, watch } = useForm();
  const [selectedTab, setSelectedTab] = useState<StatPeriod>('day');
  const [activePreset, setActivePreset] = useState<string>('30d');

  const dateRange = watch('dateRange') as string[] | undefined;

  const { startDate, endDate } = useMemo(() => {
    const end = dateRange?.[dateRange.length - 1]
      ? moment(dateRange[dateRange.length - 1]).endOf('day').valueOf()
      : moment().valueOf();
    const start = dateRange?.[0]
      ? moment(dateRange[0]).valueOf()
      : moment(end).subtract(30, 'days').valueOf();
    return { startDate: start, endDate: end };
  }, [dateRange]);

  const handlePreset = (days: number, key: string) => {
    setActivePreset(key);
    const end = moment().endOf('day').toISOString().slice(0, 10);
    const start = moment().subtract(days - 1, 'days').toISOString().slice(0, 10);
    const rangeDates: string[] = [];
    const current = moment(start);
    while (current.isSameOrBefore(end)) {
      rangeDates.push(current.format('YYYY-MM-DD'));
      current.add(1, 'day');
    }
    setValue('dateRange', rangeDates);
  };

  const stats = useSafeQuery(api.statistics.getControlFeesStatistics, {
    startDate,
    endDate,
  });

  const byAgentData = useSafeQuery(api.statistics.getControlFeesByAgent, {
    startDate,
    endDate,
  });

  const totalEvolution = useSafeQuery(api.statistics.getControlFeesEvolution, {
    startDate,
    endDate,
    groupBy: selectedTab,
  });

  const paidEvolution = useSafeQuery(api.statistics.getControlFeesEvolution, {
    startDate,
    endDate,
    groupBy: selectedTab,
    status: 'PAID',
  });

  const canceledEvolution = useSafeQuery(
    api.statistics.getControlFeesEvolution,
    { startDate, endDate, groupBy: selectedTab, status: 'CANCELED' },
  );

  const conflictEvolution = useSafeQuery(
    api.statistics.getControlFeesEvolution,
    { startDate, endDate, groupBy: selectedTab, status: 'CONFLICT' },
  );

  const isLoading = !stats || !byAgentData || !totalEvolution;

  if (isLoading) {
    return (
      <RootWrapper className="container">
        <Header title={t('statistics.title')} />
        <View className="items-center justify-center pt-20">
          <ActivityIndicator size={40} color={colors.secondary} />
        </View>
      </RootWrapper>
    );
  }

  return (
    <RootWrapper className="container">
      <Header title={t('statistics.title')} />
      <ScrollView
        className="container mt-4"
        contentContainerClassName="gap-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row items-center gap-2">
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.key}
              onPress={() => handlePreset(preset.days, preset.key)}
              className={cn(
                'rounded-full px-3 py-1.5',
                activePreset === preset.key
                  ? 'bg-secondary'
                  : 'bg-white dark:bg-background-secondary-dark',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  activePreset === preset.key
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                {preset.key}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="flex-1">
            <DateRangeSelector control={control} />
          </View>
        </View>

        <View className="flex-row justify-between rounded-full bg-white p-1 dark:bg-background-secondary-dark my-2">
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
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2">
          <StatCard
            value={stats?.total ?? 0}
            label={t('statistics.total-control-fees')}
            subtitle={t('statistics.all-issued')}
            color={colors.secondary}
          />
          <StatCard
            value={stats?.paid ?? 0}
            label={t('statistics.paid')}
            subtitle={t('statistics.successfully-paid')}
            color="#10b981"
          />
          <StatCard
            value={stats?.unpaid ?? 0}
            label={t('statistics.awaiting')}
            subtitle={t('statistics.awaiting-payment')}
            color="#f59e0b"
          />
          <StatCard
            value={`${(stats?.totalCollected ?? 0).toLocaleString()} Kr`}
            label={t('statistics.total-collected')}
            subtitle={t('statistics.total-amount-collected')}
            color="#8b5cf6"
          />
        </View>

        <View className="gap-2 my-2">
            <DistributionChart
              total={stats?.total ?? 0}
              paid={stats?.paid ?? 0}
              unpaid={stats?.unpaid ?? 0}
              canceled={stats?.canceled ?? 0}
              conflict={stats?.conflict ?? 0}
            />
            <AgentChart data={byAgentData ?? []} />
        </View>

        <TrendChart
          data={totalEvolution}
          title={`${t('statistics.total-control-fees')} - ${selectedTab}`}
          color={colors.secondary}
          period={selectedTab}
        />

        <TrendChart
          data={paidEvolution}
          title={`${t('statistics.paid')} - ${selectedTab}`}
          color="#10b981"
          period={selectedTab}
        />

        <TrendChart
          data={canceledEvolution}
          title={`${t('statistics.canceled')} - ${selectedTab}`}
          color="#ef4444"
          period={selectedTab}
        />

        <TrendChart
          data={conflictEvolution}
          title={`${t('statistics.conflict')} - ${selectedTab}`}
          color="#8b5cf6"
          period={selectedTab}
        />
      </ScrollView>
    </RootWrapper>
  );
}
