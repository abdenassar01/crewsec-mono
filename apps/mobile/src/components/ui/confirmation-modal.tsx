import React from 'react';
import { Pressable, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Modal, useModal } from '@/components/ui/modal';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  children,
}: ConfirmationModalProps) {
  const { dismiss, ref, present } = useModal();

  const handleConfirm = () => {
    onConfirm();
    dismiss();
  };

  const handlePress = (e: any) => {
    e?.stopPropagation?.();
    present();
  };

  return (
    <>
      {children && <Pressable onPress={handlePress}>{children}</Pressable>}
      <Modal index={0} snapPoints={['25%', '30%']} ref={ref}>
        <View className="justify-center p-4">
          <Text className="mb-2 text-center text-base font-bold">{title}</Text>
          <Text className="text-muted-foreground dark:text-muted-foreground-dark mb-4 text-center text-sm">
            {message}
          </Text>
          <View className="flex-row justify-center gap-3">
            <Button
              className="h-14 flex-1"
              onPress={dismiss}
              label={cancelLabel}
              variant="secondary"
            />
            <Button
              className={`h-14 flex-1 bg-red-500/10`}
              textClassName="text-red-500"
              onPress={handleConfirm}
              label={confirmLabel}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
