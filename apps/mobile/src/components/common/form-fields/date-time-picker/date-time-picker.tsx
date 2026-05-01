import React, { useState } from 'react';
import {
  Control,
  type FieldValues,
  type RegisterOptions,
  useWatch,
} from 'react-hook-form';

import { Text, TouchableOpacity, useModal, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/helpers';

import { CalendarField } from './calendar';
import { TimePicker } from './time-picker';

export interface NDateTimePickerProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  showTimePicker?: boolean;
}

type TRule<T extends FieldValues> =
  | Omit<
      RegisterOptions<T>,
      'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: string;
  control: Control<T>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues>
  extends NDateTimePickerProps, InputControllerType<T> {}

export function DateTimePicker<T extends FieldValues>({
  className,
  placeholder,
  control,
  name,
  showTimePicker: showTimePickerProp = false,
}: ControlledInputProps<T>) {
  const { present, ref, dismiss } = useModal();
  const [isTimeStep, setIsTimeStep] = useState(false);
  const form = useWatch<T>({ control });

  const displayValue = (() => {
    const dateValue =
      form &&
      form[`${name}-date`] &&
      Array.isArray(form[`${name}-date`]) &&
      form[`${name}-date`].length > 0
        ? form[`${name}-date`][0]
        : null;
    const timeValue =
      form && form[`${name}-time`] ? form[`${name}-time`] : null;

    if (dateValue && timeValue) {
      return `${dateValue} ${timeValue}`;
    }
    if (dateValue) return dateValue;
    return placeholder;
  })();

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setIsTimeStep(false);
          present();
        }}
        className={cn(
          'h-10 w-full flex-row items-center rounded-xl border border-secondary/10 bg-background-secondary px-3 dark:bg-background-secondary-dark',
          className,
        )}
      >
        <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
          {displayValue}
        </Text>
      </TouchableOpacity>
      <Modal snapPoints={['45%', '55%']} ref={ref}>
        <View className="container">
          {isTimeStep && showTimePickerProp ? (
            <TimePicker
              control={control as Control<any>}
              name={`${name}-time`}
              callback={() => {
                dismiss();
                setIsTimeStep(false);
              }}
            />
          ) : (
            <CalendarField
              callback={() => {
                if (showTimePickerProp) {
                  setIsTimeStep(true);
                } else {
                  dismiss();
                }
              }}
              control={control as Control<any>}
              name={`${name}-date`}
            />
          )}
        </View>
      </Modal>
    </>
  );
}
