import React from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import { storage } from '../storage';

const SELECTED_THEME = 'light';
type ColorSchemeName = 'light' | 'dark' | null;
export type ColorSchemeType = 'light' | 'dark' | 'system';

export const useSelectedTheme = () => {
  const _color = useColorScheme();
  const [theme, _setTheme] = useMMKVString(SELECTED_THEME, storage);

  const setSelectedTheme = React.useCallback(
    (t: ColorSchemeType) => {
      const scheme = t === 'system' ? null : t;
      Appearance.setColorScheme(scheme as ColorSchemeName);
      _setTheme(t);
    },
    [_setTheme],
  );

  const selectedTheme = (theme ?? 'system') as ColorSchemeType;
  return { selectedTheme, setSelectedTheme } as const;
};

export const loadSelectedTheme = () => {
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
    const scheme = theme === 'system' ? null : theme;
    Appearance.setColorScheme(scheme as ColorSchemeName);
  }
};
