import React, { useEffect, useState } from 'react';
import { type TextProps } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib';

interface TimeAgoProps extends TextProps {
  date: number;
}

export function TimeAgo({ date, ...props }: TimeAgoProps) {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 5) {
        setTimeString('just now');
        return;
      }

      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const years = Math.floor(days / 365);

      if (seconds < 60) {
        setTimeString('just now');
      } else if (minutes < 60) {
        setTimeString(`${minutes}min ago`);
      } else if (hours < 24) {
        setTimeString(`${hours}h ago`);
      } else if (days < 7) {
        setTimeString(`${days}d ago`);
      } else if (weeks < 52) {
        setTimeString(`${weeks}w ago`);
      } else {
        setTimeString(`${years}y ago`);
      }
    };

    updateTime();

    const intervalId = setInterval(updateTime, 60000);

    return () => clearInterval(intervalId);
  }, [date]);

  return (
    <Text className={cn('text-xxs', props.className)} {...props}>
      {timeString}
    </Text>
  );
}
