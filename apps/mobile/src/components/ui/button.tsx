import React from 'react';
import type { PressableProps, View } from 'react-native';
import { ActivityIndicator, Pressable } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { Text } from './text';

const button = tv({
  slots: {
    container:
      'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    label: 'font-medium',
    indicator: 'text-white',
  },
  variants: {
    variant: {
      default: {
        container: 'bg-primary text-black hover:bg-primary/90',
        label: 'text-black',
        indicator: 'text-black',
      },
      destructive: {
        container:
          'bg-danger-500 text-white hover:bg-danger-600 dark:bg-danger-600 dark:hover:bg-danger-700',
        label: 'text-white',
        indicator: 'text-white',
      },
      outline: {
        container:
          'border border-secondary/10 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        label: 'text-gray-900 dark:text-gray-100',
        indicator: 'text-gray-900 dark:text-gray-100',
      },
      secondary: {
        container:
          'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
        label: 'text-gray-900 dark:text-gray-100',
        indicator: 'text-gray-900 dark:text-gray-100',
      },
      ghost: {
        container: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        label: 'text-gray-900 dark:text-gray-100',
        indicator: 'text-gray-900 dark:text-gray-100',
      },
      link: {
        container: 'text-primary underline-offset-4 hover:underline',
        label: 'text-primary',
        indicator: 'text-primary',
      },
    },
    size: {
      default: {
        container: 'h-10 px-4 py-2',
        label: 'text-sm',
      },
      sm: {
        container: 'h-9 rounded-xl px-3',
        label: 'text-xs',
      },
      lg: {
        container: 'h-11 rounded-xl px-8',
        label: 'text-base',
      },
      icon: {
        container: 'h-10 w-10',
      },
    },
    disabled: {
      true: {
        container: 'opacity-50 cursor-not-allowed',
      },
    },
    fullWidth: {
      true: {
        container: 'w-full',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
interface Props extends ButtonVariants, Omit<PressableProps, 'disabled'> {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = React.forwardRef<View, Props>(
  (
    {
      label: text,
      loading = false,
      variant = 'default',
      disabled = false,
      size = 'default',
      className = '',
      testID,
      textClassName = '',
      ...props
    },
    ref,
  ) => {
    const styles = React.useMemo(
      () => button({ variant, disabled, size }),
      [variant, disabled, size],
    );

    return (
      <Pressable
        disabled={disabled || loading}
        className={styles.container({ className })}
        {...props}
        ref={ref}
        testID={testID}
      >
        {props.children ? (
          props.children
        ) : (
          <>
            {loading ? (
              <ActivityIndicator
                size="small"
                className={styles.indicator()}
                testID={testID ? `${testID}-activity-indicator` : undefined}
              />
            ) : (
              <Text
                testID={testID ? `${testID}-label` : undefined}
                className={styles.label({ className: textClassName })}
              >
                {text}
              </Text>
            )}
          </>
        )}
      </Pressable>
    );
  },
);
