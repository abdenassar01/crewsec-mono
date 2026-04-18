import moment from 'moment';
import React from 'react';

import { Text } from '@/components/ui';

interface Props {
  time: string | number;
  className?: string;
}

export const DateTimeFormatter = ({ time, className }: Props) => {
  return (
    <Text className={className}>
      {moment(new Date(time)).format('DD MMM YYYY, HH:mm')}
    </Text>
  );
};
