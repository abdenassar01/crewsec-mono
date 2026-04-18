import * as React from 'react';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export const CaretDown = ({ ...props }: SvgProps) => (
  <View className="size-6 items-center justify-center rounded-full bg-secondary dark:bg-primary">
    <Ionicons name="chevron-down" size={14} color="#fff" />
  </View>
);
