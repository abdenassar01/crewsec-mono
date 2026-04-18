import React from 'react';
import {
  type Control,
  type FieldValues,
  type RegisterOptions,
  useWatch,
} from 'react-hook-form';

import { Text, TouchableOpacity, useModal, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/helpers';

import { CalendarField } from './calendar';

export interface NDateTimePickerProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
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
}: ControlledInputProps<T>) {
  const { present, ref, dismiss } = useModal();
  // const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const form = useWatch<T>({ control });

  return (
    <>
      <TouchableOpacity
        onPress={present}
        className={cn(
          'h-10 w-full flex-row items-center rounded-xl border border-secondary/10 bg-background-secondary px-3 dark:bg-background-secondary-dark',
          className,
        )}
      >
        <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
          {form &&
          form[`${name}-date`] &&
          Array.isArray(form[`${name}-date`]) &&
          form[`${name}-date`].length > 0
            ? form[`${name}-date`][0] || placeholder
            : placeholder}
        </Text>
      </TouchableOpacity>
      <Modal snapPoints={['45%', '55%']} ref={ref}>
        <View className="container">
          {/* {showTimePicker ? (
            <TimePicker
              control={control}
              name={`${name}-time`}
              callback={() => {
                dismiss();
                setShowTimePicker(false);
              }}
            />
          ) : ( */}
          <CalendarField
            // callback={() => setShowTimePicker(true)}
            callback={dismiss}
            control={control}
            name={`${name}-date`}
          />
          {/* )} */}
        </View>
      </Modal>
    </>
  );
}
