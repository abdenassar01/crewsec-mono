import { MotiView } from 'moti';
import { useColorScheme } from 'react-native';
import React, { useCallback } from 'react';
import {
  I18nManager,
  Pressable,
  type PressableProps,
  View,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from './text';

const SIZE = 20;
const WIDTH = 44;
const HEIGHT = 24;
const THUMB_SIZE = 20;
const THUMB_OFFSET = 2;

export interface RootProps extends Omit<PressableProps, 'onPress'> {
  onChange: (checked: boolean) => void;
  checked?: boolean;
  className?: string;
  accessibilityLabel: string;
}

export type IconProps = {
  checked: boolean;
};

export const Root = ({
  checked = false,
  children,
  onChange,
  disabled,
  className = '',
  ...props
}: RootProps) => {
  const handleChange = useCallback(() => {
    onChange(!checked);
  }, [onChange, checked]);

  return (
    <Pressable
      onPress={handleChange}
      className={`flex-row items-center ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
      accessibilityState={{ checked }}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
};

type LabelProps = {
  text: string;
  className?: string;
  testID?: string;
};

const Label = ({ text, testID, className = '' }: LabelProps) => {
  return (
    <Text testID={testID} className={`pl-2 ${className}`}>
      {text}
    </Text>
  );
};

export const CheckboxIcon = ({ checked = false }: IconProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const borderColor = checked ? '#FECC02' : isDark ? '#4B5563' : '#D1D5DB';
  const backgroundColor = checked ? '#FECC02' : 'transparent';
  const checkColor = '#000000';

  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderWidth: 2,
        borderColor,
        backgroundColor,
      }}
      className="items-center justify-center rounded"
      from={{
        backgroundColor: 'transparent',
        borderColor: isDark ? '#4B5563' : '#D1D5DB',
      }}
      animate={{
        backgroundColor,
        borderColor,
      }}
      transition={{
        backgroundColor: { type: 'timing', duration: 150 },
        borderColor: { type: 'timing', duration: 150 },
      }}
    >
      {checked && (
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ opacity: { duration: 150 }, scale: { duration: 150 } }}
        >
          <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17L4 12"
              stroke={checkColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </MotiView>
      )}
    </MotiView>
  );
};

const CheckboxRoot = ({ checked = false, children, ...props }: RootProps) => {
  return (
    <Root checked={checked} accessibilityRole="checkbox" {...props}>
      {children}
    </Root>
  );
};

const CheckboxBase = ({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) => {
  return (
    <CheckboxRoot checked={checked} testID={testID} {...props}>
      <CheckboxIcon checked={checked} />
      {label ? (
        <Label
          text={label}
          testID={testID ? `${testID}-label` : undefined}
          className="pr-2"
        />
      ) : null}
    </CheckboxRoot>
  );
};

export const Checkbox = Object.assign(CheckboxBase, {
  Icon: CheckboxIcon,
  Root: CheckboxRoot,
  Label,
});

export const RadioIcon = ({ checked = false }: IconProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const borderColor = checked ? '#FECC02' : isDark ? '#4B5563' : '#D1D5DB';

  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderWidth: 2,
        borderColor,
      }}
      className="items-center justify-center rounded-full"
      from={{ borderColor: isDark ? '#4B5563' : '#D1D5DB' }}
      animate={{ borderColor }}
      transition={{ borderColor: { duration: 150 } }}
    >
      {checked && (
        <MotiView
          style={styles.radioInner}
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ opacity: { duration: 150 }, scale: { duration: 150 } }}
        />
      )}
    </MotiView>
  );
};

const RadioRoot = ({ checked = false, children, ...props }: RootProps) => {
  return (
    <Root checked={checked} accessibilityRole="radio" {...props}>
      {children}
    </Root>
  );
};

const RadioBase = ({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) => {
  return (
    <RadioRoot checked={checked} testID={testID} {...props}>
      <RadioIcon checked={checked} />
      {label ? (
        <Label text={label} testID={testID ? `${testID}-label` : undefined} />
      ) : null}
    </RadioRoot>
  );
};

export const Radio = Object.assign(RadioBase, {
  Icon: RadioIcon,
  Root: RadioRoot,
  Label,
});

export const SwitchIcon = ({ checked = false }: IconProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const translateX = checked ? THUMB_OFFSET : WIDTH - THUMB_SIZE - THUMB_OFFSET;
  const backgroundColor = checked ? '#FECC02' : isDark ? '#4B5563' : '#9CA3AF';

  return (
    <View style={styles.switchContainer}>
      <View style={styles.switchTrack}>
        <View style={[styles.switchBackground, { backgroundColor }]} />
      </View>
      <MotiView
        style={styles.switchThumb}
        animate={{
          translateX: I18nManager.isRTL ? -translateX : translateX,
        }}
        transition={{
          translateX: { overshootClamping: true, damping: 15, stiffness: 200 },
        }}
      />
    </View>
  );
};

const SwitchRoot = ({ checked = false, children, ...props }: RootProps) => {
  return (
    <Root checked={checked} accessibilityRole="switch" {...props}>
      {children}
    </Root>
  );
};

const SwitchBase = ({
  checked = false,
  testID,
  label,
  ...props
}: RootProps & { label?: string }) => {
  return (
    <SwitchRoot checked={checked} testID={testID} {...props}>
      <SwitchIcon checked={checked} />
      {label ? (
        <Label text={label} testID={testID ? `${testID}-label` : undefined} />
      ) : null}
    </SwitchRoot>
  );
};

export const Switch = Object.assign(SwitchBase, {
  Icon: SwitchIcon,
  Root: SwitchRoot,
  Label,
});

const styles = StyleSheet.create({
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FECC02',
  },
  switchContainer: {
    height: HEIGHT,
    width: WIDTH,
    justifyContent: 'center',
  },
  switchTrack: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  switchBackground: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 12,
  },
  switchThumb: {
    height: THUMB_SIZE,
    width: THUMB_SIZE,
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
