/* eslint-disable max-lines-per-function */
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Image } from 'react-native';
import * as React from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native';
import { I18nManager, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextInput as NTextInput } from 'react-native';
import { tv } from 'tailwind-variants';

import { cn } from '@/lib/helpers';

import colors, { secondary } from './colors';
import { Text } from './text';
import { Ionicons } from '@expo/vector-icons';

const inputTv = tv({
  slots: {
    container: 'mb-4',
    label: 'mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200',
    input:
      'h-12 rounded-xl border border-gray-300 bg-white px-3 text-sm text-black placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
  },

  variants: {
    focused: {
      true: {
        input: 'border-primary ring-primary/20 ring-2',
      },
    },
    error: {
      true: {
        input: 'border-danger-500 dark:border-danger-400',
        label: 'text-danger-500 dark:text-danger-400',
      },
    },
    disabled: {
      true: {
        input: 'cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-700',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  wrapperClassName?: string;
  sheet?: boolean;
  password?: boolean;
}

type TRule<T extends FieldValues> =
  | Omit<
      RegisterOptions<T>,
      'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<any>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues>
  extends NInputProps, InputControllerType<T> {}

export const Input = React.forwardRef<NTextInput, NInputProps>((props, ref) => {
  const { label, error, testID, wrapperClassName, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const [isPassword, setIsPassword] = React.useState<boolean>(
    props.password || false,
  );

  const { t } = useTranslation();

  const styles = React.useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(props.disabled),
      }),
    [error, isFocussed, props.disabled],
  );

  return (
    <View className={cn(styles.container(), wrapperClassName)}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      {props.sheet ? (
        <BottomSheetTextInput
          testID={testID}
          placeholderTextColor={colors.neutral[400]}
          onBlur={onBlur}
          onFocus={onFocus}
          {...inputProps}
          className={cn(styles.input(), inputProps.className)}
          ref={ref as any}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
          ])}
        />
      ) : (
        <NTextInput
          testID={testID}
          ref={ref}
          placeholderTextColor={colors.neutral[400]}
          onBlur={onBlur}
          onFocus={onFocus}
          {...inputProps}
          className={cn(styles.input(), inputProps.className)}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
          ])}
          secureTextEntry={isPassword}
        />
      )}
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-danger-500 dark:text-danger-400 mt-1 text-xs"
        >
          {t(error)}
        </Text>
      )}
      {props.password && (
        <TouchableOpacity
          onPress={() => setIsPassword((prev) => !prev)}
          className={cn(
            'absolute right-3 top-10',
          )}
        >
          <Ionicons name={isPassword ? 'eye-off-outline' : 'eye-outline'} color={secondary} size={18} />
        </TouchableOpacity>
      )}
    </View>
  );
});

export function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>,
) {
  const { name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  return (
    <Input
      ref={field.ref}
      autoCapitalize="none"
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      value={(field.value as string) || ''}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
}
