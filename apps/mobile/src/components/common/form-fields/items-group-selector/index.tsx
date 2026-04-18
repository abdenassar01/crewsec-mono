/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { type Control, useController } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { Modal, Text, useModal } from '@/components/ui';
import {
  backgroundDark,
  backgroundSecondary,
  secondary,
} from '@/components/ui/colors';
import { cn } from '@/lib/helpers';

import { Map } from '../../map';

interface Props<T, V> {
  control: Control<any>;
  name: string;
  label: string;
  loading?: boolean;
  items: T[];
  extractDisplayValue: (item: T) => string;
  extractValue: (item: T) => V;
}

export function ItemsGroupSelector<T, V>({
  control,
  name,
  extractDisplayValue,
  extractValue,
  items,
  loading,
  label,
}: Props<T, V>) {
  const {
    field: { onChange, value },
  } = useController({ control, name, defaultValue: [] });

  const { ref, present } = useModal();

  function isSelected(item: T) {
    return value.find((el: V) => el === extractValue(item));
  }

  return (
    <>
      <TouchableOpacity
        style={{ backgroundColor: `${secondary}31` }}
        className="flex-row items-center gap-3 rounded-full p-2 px-3"
        onPress={present}
      >
        <Text className="text-sm font-medium text-secondary">{label} </Text>
        {loading ? (
          <ActivityIndicator color={secondary} />
        ) : (
          <Ionicons name="chevron-down" color={secondary} />
        )}
      </TouchableOpacity>
      <Modal ref={ref} snapPoints={['25%', '30%']}>
        <ScrollView className="container mt-3">
          <View className="flex-row flex-wrap gap-3">
            <Map
              items={items}
              render={(item) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange([...value, extractValue(item)]);
                  }}
                  style={{
                    backgroundColor: isSelected(item)
                      ? secondary
                      : `${secondary}31`,
                  }}
                  className="flex-row items-center gap-3 rounded-full p-2 px-3 "
                >
                  <Text
                    className={cn(
                      'text-sm',
                      isSelected(item)
                        ? 'text-background-secondary dark:text-background-secondaryDark'
                        : 'text-secondary',
                    )}
                  >
                    {extractDisplayValue(item)}
                  </Text>
                  {isSelected(item) && (
                    <TouchableOpacity
                      onPress={() =>
                        onChange(
                          value.filter((el: V) => el !== extractValue(item)),
                        )
                      }
                      style={{ backgroundColor: `${backgroundDark}31` }}
                      className="rounded-full p-1"
                    >
                      <Ionicons name="close" color={backgroundSecondary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
            <View className="h-10 w-full" />
          </View>
        </ScrollView>
      </Modal>
    </>
  );
}
