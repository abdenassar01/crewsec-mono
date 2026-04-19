/* eslint-disable max-lines-per-function */
import React from 'react';
import { type Control, type Path, useController } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';

import {
  ActivityIndicator,
  colors,
  Image,
  Input,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { cn } from '@/lib';

interface Props<T, TControl extends Record<string, any>> {
  label: string;
  name: string;
  control: Control<TControl>;
  items: T[];
  extractValue: (item: T) => any;
  extractDisplayMember: (item: T) => string;
  wrapperClassName?: string;
  className?: string;
  loading?: boolean;
  onTextChange?: (value: string) => void;
}

export function StaticDataSelector<T, TControl extends Record<string, any>>({
  extractDisplayMember,
  extractValue,
  items,
  control,
  className,
  wrapperClassName,
  label,
  loading,
  name,
  onTextChange,
}: Props<T, TControl>) {
  const [query, setQuery] = React.useState<string>('');

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name: name as Path<TControl>, control });

  return (
    <View className={cn('', wrapperClassName)}>
      <Text className="mb-0.5 text-xs text-secondary">{label}</Text>
      <Input
        value={query}
        placeholder="Search"
        onChangeText={(t) => {
          setQuery(t);
          onTextChange?.(t);
        }}
      />
      <ScrollView
        nestedScrollEnabled
        contentContainerClassName="gap-2"
        className={cn(
          'h-52 w-full rounded-xl bg-background-secondary p-2 dark:bg-background-secondary-dark',
          className,
        )}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={`car-brand-item-${extractValue(item)}`}
              onPress={() => onChange(extractValue(item))}
              className={cn(
                'rounded-lg p-2 px-3',
                value === extractValue(item)
                  ? 'bg-success-600'
                  : 'bg-background-secondary dark:bg-background-secondary-dark',
              )}
            >
              {value === extractValue(item) && (
                <Image
                  className="absolute right-1 top-1 size-3 rounded-full bg-white p-2 dark:bg-background-secondary-dark"
                  source={require('assets/icons/checkbox.png')}
                />
              )}
              <Text
                className={cn(
                  'font-medium text-xs',
                  value === extractValue(item)
                    ? 'text-white'
                    : 'text-secondary dark:text-yellow-400',
                )}
              >
                {extractDisplayMember(item)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <Text className="!text-xxs text-red-400">{error?.message}</Text>
    </View>
  );
}
