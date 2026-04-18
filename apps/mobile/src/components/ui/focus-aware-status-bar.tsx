import { useIsFocused } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = { hidden?: boolean };
export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  const systemColorScheme = useColorScheme();

  if (Platform.OS === 'web') return null;

  const colorScheme = systemColorScheme ?? 'light';

  return isFocused ? <SystemBars style={colorScheme} hidden={hidden} /> : null;
};
