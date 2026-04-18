import React from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';

import { Modal, Text, useModal } from '@/components/ui';

import { CalendarField } from '../date-time-picker/calendar';

interface Props {
  control: Control<any>;
}

export function DateRangeSelector({ control }: Props) {
  const { dateRange } = useWatch({ control });
  const { present, ref } = useModal();

  return (
    <View className="w-full flex-row justify-end">
      <TouchableOpacity
        className="mt-3 rounded-full bg-secondary/10 p-2 px-4"
        onPress={present}
      >
        {dateRange?.length > 0 ? (
          <>
            <Text className="text-xs">
              {dateRange[0] + ' -> ' + dateRange[dateRange.length - 1]}
            </Text>
          </>
        ) : (
          <Text className="text-xs text-secondary">Select Date</Text>
        )}
      </TouchableOpacity>
      <Modal ref={ref} snapPoints={['35%', '45%']}>
        <CalendarField name="dateRange" control={control} />
      </Modal>
    </View>
  );
}
