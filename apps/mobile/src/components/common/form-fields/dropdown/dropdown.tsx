import React from 'react';
import { type Control, useController } from 'react-hook-form';

import { Select, Text } from '@/components/ui';

interface Props<T> {
  control: Control<any>;
  name: string;
  label?: string;
  items: T[];
  extractDisplayMember: (item: T) => string;
  extractValueMember: (item: T) => any;
}

export function Dropdown<T>({
  control,
  name,
  label,
  extractDisplayMember,
  extractValueMember,
  items,
}: Props<T>) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <>
      <Select
        label={label}
        options={items.map((item) => ({
          label: extractDisplayMember(item),
          value: extractValueMember(item),
        }))}
        value={value}
        onSelect={onChange}
      />
      <Text className="-mt-2 text-[10px] text-danger-600">
        {error?.message}
      </Text>
    </>
  );
}
