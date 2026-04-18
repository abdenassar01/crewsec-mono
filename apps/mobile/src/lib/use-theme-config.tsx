import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import colors from '@/components/ui/colors';

const DarkTheme: Theme = {
  ..._DarkTheme,
  dark: true,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary,
    background: colors.backgroundDark,
    text: colors.black,
    border: colors.gray,
    card: colors.backgroundSecondaryDark,
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundSecondary,
  },
};

export function useThemeConfig() {
  const colorScheme = useColorScheme();

  if (colorScheme === 'dark') return DarkTheme;

  return LightTheme;
}
