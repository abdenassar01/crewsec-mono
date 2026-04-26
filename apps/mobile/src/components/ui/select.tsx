/* eslint-disable max-lines-per-function */
import {
  BottomSheetFlatList,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'react-native';
import * as React from 'react';
import { useController } from 'react-hook-form';
import { Platform, View } from 'react-native';
import { Pressable, type PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';
import colors from '@/components/ui/colors';
import { CaretDown } from '@/components/ui/icons';
import { cn } from '@/lib';

import { type AnyControl } from './input';
import { useModal } from './modal';
import { Modal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-4 w-full',
    label: 'text-sm text-gray-700 dark:text-gray-200 mb-1.5 font-medium',
    input:
      'h-10 px-3 rounded-xl border border-secondary/10 bg-background-secondary dark:bg-background-secondary-dark text-sm text-gray-900 dark:text-gray-100 flex-row items-center justify-between',
    inputValue: 'text-sm text-gray-500',
  },

  variants: {
    focused: {
      true: {
        input: 'border-primary ring-2 ring-primary/20',
      },
    },
    error: {
      true: {
        input: 'border-danger-500 dark:border-danger-400',
        label: 'text-danger-500 dark:text-danger-400',
        inputValue: 'text-danger-500',
      },
    },
    disabled: {
      true: {
        input: 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

const List = Platform.OS === 'web' ? FlashList : BottomSheetFlatList;

export type OptionType = { label: string; value: string | number };

type OptionsProps = {
  options: OptionType[];
  onSelect: (option: OptionType) => void;
  value?: string | number;
  testID?: string;
};

function keyExtractor(item: OptionType) {
  return `select-item-${item.value}`;
}

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value, testID }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderSelectItem = React.useCallback(
      ({ item }: { item: OptionType }) => (
        <Option
          key={`select-item-${item.value}-${item.label}`}
          label={item.label}
          selected={value === item.value}
          onPress={() => onSelect(item)}
          testID={testID ? `${testID}-item-${item.value}` : undefined}
        />
      ),
      [onSelect, value, testID],
    );

    return (
      <Modal
        ref={ref}
        index={0}
        snapPoints={['30%', '40%']}
        backgroundStyle={{
          backgroundColor: isDark ? colors.neutral[800] : colors.white,
        }}
      >
        <View className="container pb-8">
          <List
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderSelectItem}
            testID={testID ? `${testID}-modal` : undefined}
          />
        </View>
      </Modal>
    );
  },
);

const Option = React.memo(
  ({
    label,
    selected = false,
    ...props
  }: PressableProps & {
    selected?: boolean;
    label: string;
  }) => {
    return (
      <Pressable
        className={cn(
          'flex-row items-center border-b border-secondary/10 bg-background-secondary px-3 py-2 dark:bg-background-secondary-dark',
        )}
        {...props}
      >
        <Text
          className={cn(
            'flex-1 text-sm ',
            selected
              ? 'text-gray-900 dark:text-gray-100 '
              : 'text-gray-600 dark:text-gray-400',
          )}
        >
          {label}
        </Text>
        {selected && <Check />}
      </Pressable>
    );
  },
);

export interface SelectProps {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: OptionType[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
  testID?: string;
  className?: string;
  wrapperClassName?: string;
}
interface ControlledSelectProps extends SelectProps {
  control: AnyControl;
  name: string;
  rules?: Record<string, unknown>;
}

export const Select = (props: SelectProps) => {
  const {
    label,
    value,
    error,
    options = [],
    placeholder = 'select...',
    disabled = false,
    onSelect,
    testID,
    className,
    wrapperClassName,
  } = props;
  const modal = useModal();

  const onSelectOption = React.useCallback(
    (option: OptionType) => {
      onSelect?.(option.value);
      modal.dismiss();
    },
    [modal, onSelect],
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled],
  );

  const textValue = React.useMemo(
    () =>
      value !== undefined
        ? (options?.filter((t) => t.value === value)?.[0]?.label ?? placeholder)
        : placeholder,
    [value, options, placeholder],
  );

  return (
    <>
      <View className={cn(styles.container(), wrapperClassName)}>
        {label && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            className={styles.label()}
          >
            {label}
          </Text>
        )}
        <Pressable
          className={cn(styles.input(), className)}
          disabled={disabled}
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          <View className="flex-1">
            <Text
              className={cn(
                styles.inputValue(),
                textValue === options.find((t) => t.value === value)?.label
                  ? 'text-gray-900 dark:text-gray-100'
                  : '',
              )}
            >
              {textValue}
            </Text>
          </View>
          <CaretDown />
        </Pressable>
        {error && (
          <Text
            testID={`${testID}-error`}
            className="text-sm text-danger-300 dark:text-danger-600"
          >
            {error}
          </Text>
        )}
      </View>
      <Options
        testID={testID}
        ref={modal.ref}
        options={options}
        onSelect={onSelectOption}
      />
    </>
  );
};

export function ControlledSelect(
  props: ControlledSelectProps,
) {
  const { name, control, rules, onSelect: onNSelect, ...selectProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  const onSelect = React.useCallback(
    (value: string | number) => {
      field.onChange(value);
      onNSelect?.(value);
    },
    [field, onNSelect],
  );
  return (
    <Select
      onSelect={onSelect}
      value={field.value}
      error={fieldState.error?.message}
      {...selectProps}
    />
  );
}

const Check = ({ ...props }: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    viewBox="0 0 25 24"
    {...props}
    className="stroke-black dark:stroke-white"
  >
    <Path
      d="m20.256 6.75-10.5 10.5L4.506 12"
      strokeWidth={2.438}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
