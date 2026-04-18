import { Image } from 'react-native';
import { useColorScheme } from 'react-native';
import * as React from 'react';

export const Cover = () => {
  const colorScheme = useColorScheme();
  const isDark = React.useCallback(() => colorScheme === 'dark', [colorScheme]);

  return (
    <Image
      className="h-[65px] w-[250px]"
      source={
        isDark()
          ? require('assets/icons/dark/logo.png')
          : require('assets/icons/light/logo.png')
      }
    />
  );
};
