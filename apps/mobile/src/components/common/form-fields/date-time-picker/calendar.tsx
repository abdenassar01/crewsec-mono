/* eslint-disable max-lines-per-function */
import React, { useMemo } from 'react';
import { type Control, useController } from 'react-hook-form';
import { useColorScheme } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  type DateData,
  type MarkedDates,
} from 'react-native-calendars/src/types';

import { Text, TouchableOpacity, View } from '@/components/ui';
import colors from '@/components/ui/colors';

type Props = {
  control: Control<any>;
  name: string;
  callback?: () => void;
};

export function CalendarField({ control, name, callback }: Props) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const colorScheme = useColorScheme();
  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);

  const getFirstDay = (): string => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return '';
    }
    let min = value[0];
    if (value.length <= 1) {
      return min || '';
    }
    value.map((day: string) => {
      if (day && compareTwoDates(day, min) === -1) {
        min = day;
      }
    });
    return min || '';
  };

  function compareTwoDates(firstDate: string, secondDate: string) {
    const date1 = firstDate.split('-');
    const date2 = secondDate.split('-');

    if (date1[0] > date2[0]) {
      return 1;
    } else if (date1[0] < date2[0]) {
      return -1;
    } else if (date1[1] > date2[1]) {
      return 1;
    } else if (date1[1] < date2[1]) {
      return -1;
    } else if (date1[2] > date2[2]) {
      return 1;
    } else {
      return -1;
    }
  }

  const getLastDay = (): string => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return '';
    }
    let max = value[0];
    if (value.length <= 1) {
      return max || '';
    }
    value.map((day: string) => {
      if (day && compareTwoDates(day, max) === 1) {
        max = day;
      }
    });
    return max || '';
  };

  const getMarkedDates = (dates: string[]): MarkedDates => {
    let marked = {};

    if (!dates || !Array.isArray(dates)) {
      return marked;
    }

    dates.map((date) => {
      if (!date) return;
      // @ts-ignore
      return (marked[date] = {
        selected: true,
        selectedDotColor: 'transparent',
        color:
          date === getFirstDay() || date === getLastDay()
            ? isDark
              ? colors.primary
              : colors.secondary
            : `${isDark ? colors.secondary : colors.secondary}60`,
        startingDay: date === getFirstDay(),
        endingDay: date === getLastDay(),
      });
    });
    return marked;
  };

  function getDates(startDate: Date, endDate: Date) {
    const dayInterval = 1000 * 60 * 60 * 24;
    const duration = endDate.getTime() - startDate.getTime();
    const steps = duration / dayInterval;
    return Array.from({ length: steps + 1 }, (v, i) =>
      new Date(startDate.valueOf() + dayInterval * i)
        .toISOString()
        .slice(0, 10),
    );
  }

  function handleDayPress(day: DateData) {
    try {
      if (!value || value.length < 1) {
        onChange([day.dateString]);
      } else {
        const lastDay = getLastDay();
        const firstDay = getFirstDay();

        if (!lastDay || !firstDay) {
          onChange([day.dateString]);
          callback && callback();
          return;
        }

        const last =
          new Date(day.dateString) > new Date(lastDay)
            ? day.dateString
            : lastDay;

        const first =
          new Date(day.dateString) < new Date(firstDay)
            ? day.dateString
            : firstDay;

        onChange(getDates(new Date(first), new Date(last)));
      }
      callback && callback();
    } catch (error) {
      console.error('Error in handleDayPress:', error);
      // Fallback to just setting the single date
      onChange([day.dateString]);
      callback && callback();
    }
  }

  // const calculatePeriod = () => {
  //   let placeholder = '';
  //   if (value.length === 0) {
  //     return undefined;
  //   }
  //   if (value.length > 1) {
  //     placeholder = `[${getFirstDay()}...${getLastDay()}]`;
  //   } else {
  //     placeholder = `[${value[0]}]`;
  //   }

  //   return placeholder;
  // };

  return (
    <View className="container">
      <Calendar
        style={{ borderRadius: 12 }}
        onDayPress={handleDayPress}
        markedDates={getMarkedDates(value)}
        markingType="period"
        theme={{
          calendarBackground: isDark
            ? colors.backgroundSecondaryDark
            : colors.backgroundSecondary,
          contentStyle: {
            borderRadius: 10,
          },
          selectedDayBackgroundColor: isDark
            ? colors.primary
            : colors.secondary,
          selectedDayTextColor: colors.white,
          dayTextColor: isDark ? colors.textdark : colors.text,
        }}
      />
      <Text className="!text-xxs text-danger-500">{error?.message}</Text>
      <TouchableOpacity onPress={() => onChange([])} className="">
        <Text className="!text-xxs text-danger-500">Reset</Text>
      </TouchableOpacity>
    </View>
  );
}
