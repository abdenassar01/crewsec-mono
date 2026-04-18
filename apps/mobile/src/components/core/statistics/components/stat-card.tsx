import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import React from 'react';

import { Text, View } from '@/components/ui';

interface Props {
  icon: 'stats-chart' | 'car' | 'danger' | 'parking' | 'users';
  value: number | string;
  label: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'success';
}

const iconMap = {
  'stats-chart': {
    dark: require('assets/icons/dark/stats-chart.png'),
    light: require('assets/icons/light/stats-chart.png'),
  },
  car: {
    dark: require('assets/icons/dark/car.png'),
    light: require('assets/icons/light/car.png'),
  },
  danger: {
    dark: require('assets/icons/dark/danger.png'),
    light: require('assets/icons/light/danger.png'),
  },
  parking: {
    dark: require('assets/icons/dark/parking.png'),
    light: require('assets/icons/light/parking.png'),
  },
  users: {
    dark: require('assets/icons/dark/users.png'),
    light: require('assets/icons/light/users.png'),
  },
};

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  danger: 'text-red-500',
  success: 'text-green-500',
};

export function StatCard({
  icon,
  value,
  label,
  subtitle,
  color = 'primary',
}: Props) {
  const colorScheme = useColorScheme();
  const iconSource =
    colorScheme === 'dark' ? iconMap[icon].dark : iconMap[icon].light;
  const valueColor = colorMap[color];

  return (
    <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
      <Image source={iconSource} className="mb-2 h-8 w-8" />
      <Text className={`text-3xl font-bold ${valueColor}`}>{value}</Text>
      <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
        {label}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-center text-[10px] text-gray-400 dark:text-gray-500">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
