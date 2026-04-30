import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button, Modal, useModal } from '@/components/ui';
import { useVehicleControlSession } from '@/contexts/vehicle-control-session-context';
import { formatTimeMs } from '@/lib';

interface SessionTimerProps {
  startTime: number | null;
  onStartSession: () => void;
}

export function SessionTimer({ startTime, onStartSession }: SessionTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white p-2 px-4 dark:bg-background-secondary-dark">
      {startTime ? (
        <>
          <Text className="border-success-500 text-xl font-bold text-success-500">
            {formatTimeMs(elapsedTime)}
          </Text>
          <EndSession />
        </>
      ) : (
        <>
          <Text className="text-muted-foreground dark:text-muted-foreground-dark font-bold">
            No Active Session
          </Text>
          <Button
            label="Start New Session"
            className="h-10 w-[49%] bg-success-500/10"            
            textClassName="text-success-500 text-xs font-normal"
            onPress={onStartSession}
          />
        </>
      )}
    </View>
  );
}

export function EndSession() {
  const { dismiss, present, ref } = useModal();
  const { endSession } = useVehicleControlSession();
  const { t } = useTranslation();
  return (
    <>
      <Button
        label={t('end-session')}
        className="rounded-lg bg-red-500/10 px-4 max-w-32"
        textClassName="text-red-500 text-xs font-normal"
        onPress={present}
      />
      <Modal ref={ref} snapPoints={['20%', '35%']}>
        <View className="p-4">
          <Text className="mb-3 text-center text-lg">{t('modal.session')}</Text>
          <View className="flex-row items-center justify-between">
            <Button
              className="h-10 w-[49%] bg-success-500/10"
              textClassName="text-success-500"
              label={t('cancel')}
              onPress={dismiss}
            />
            <Button
              className="h-10 w-[49%] bg-danger-500/10"
              textClassName="text-danger-500"
              label={t('yes')}
              onPress={endSession}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
