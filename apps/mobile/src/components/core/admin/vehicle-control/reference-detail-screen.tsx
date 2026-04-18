/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Id } from 'convex/_generated/dataModel';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Pressable, ScrollView, View } from 'react-native';

import { ImageGalleryItem } from '@/components/common';
import { Button, Modal, Text, useModal } from '@/components/ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { getUser } from '@/lib/storage/user-storage';
import { referenceDetailsStorage } from '@/services/vehicle-control-storage';

import { EasyparkCheckReference } from '../control-fee';
import {
  PrinterSection,
  VehicleSelect,
  ViolationSelect,
  YesNoQuestions,
} from '../control-parking';
import { ReceiptViewerModal } from './receipt-viewer-modal';
import { type ReferenceEntry, referenceEntrySchema } from './types-offline';

interface ReferenceDetailScreenProps {
  referenceId: string;
  referenceNumber: string;
  locationId: Id<'locations'>;
  townId: Id<'towns'>;
  onBack: () => void;
  startTime: number | null;
}

export function ReferenceDetailScreen({
  referenceId,
  referenceNumber,
  locationId,
  townId,
  onBack,
  startTime,
}: ReferenceDetailScreenProps) {
  const { t } = useTranslation();
  const { dismiss, ref } = useModal();
  const user = getUser();

  const { control, watch, reset } = useForm<ReferenceEntry>({
    resolver: zodResolver(referenceEntrySchema),
    defaultValues: {
      id: referenceId,
      reference: referenceNumber,
      locationId,
      townId,
      mark: undefined,
      violationId: undefined,
      galleryStorageIds: [],
      isSignsChecked: false,
      isPhotosTaken: false,
      startDate: startTime || Date.now(),
      createdAt: Date.now(),
      userId: user?.userId || '',
    },
  });

  useEffect(() => {
    if (!user?.userId) return;

    const saved = referenceDetailsStorage.getReferenceDetails(
      referenceId,
      user.userId,
    );
    if (saved) {
      reset(saved as ReferenceEntry);
    }
    const subscription = watch((value) => {
      try {
        const entry = value as ReferenceEntry;
        if (entry && entry.id) {
          referenceDetailsStorage.saveReferenceDetails(entry);
        }
      } catch {}
    });
    return () => {
      const current = watch() as ReferenceEntry;
      if (current && current.id) {
        referenceDetailsStorage.saveReferenceDetails(current);
      }
      subscription.unsubscribe?.();
    };
  }, [referenceId, user?.userId]);

  const handleModalConfirm = () => {
    dismiss();
    onBack();
  };

  const handleDeleteConfirm = () => {
    if (!user?.userId) return;
    referenceDetailsStorage.deleteReferenceDetails(referenceId, user.userId);
    onBack();
  };

  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between rounded-lg border border-secondary/10 bg-background-secondary p-2 px-4 dark:bg-background-secondary-dark">
        <View className="">
          <Text className="text-muted-foreground dark:text-muted-foreground-dark text-xs">
            {t('forms.reference')}
          </Text>
          <Text className="text-xl font-bold text-secondary dark:text-yellow-400">
            {referenceNumber}
          </Text>
        </View>
        <ConfirmationModal
          title={t('reference-detail.delete-title')}
          message={t('reference-detail.delete-message')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('cancel')}
          onConfirm={handleDeleteConfirm}
        >
          <Pressable hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </Pressable>
        </ConfirmationModal>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView>
          <View className="space-y-4">
            <View className="gap-3">
              <VehicleSelect control={control} name="mark" className="flex-1" />
              <ViolationSelect
                control={control}
                name="violationId"
                className="flex-1"
              />
            </View>

            <EasyparkCheckReference name="easyParkResponse" control={control} />

            <ImageGalleryItem
              control={control as any}
              name="galleryStorageIds"
              label={t('forms.gallery')}
            />
            <YesNoQuestions control={control} />
            <PrinterSection control={control} />
          </View>
        </KeyboardAvoidingView>
        <View className="mb-3 flex-1">
          <ReceiptViewerModal control={control} />
        </View>
      </ScrollView>

      <Modal ref={ref} snapPoints={['20%', '35%']}>
        <View className="p-4">
          <Text className="mb-3 text-center text-lg">Title</Text>
          <Text className="text-muted-foreground dark:text-muted-foreground-dark mb-6 text-center">
            Helo world
          </Text>
          <Button
            className="h-14 w-full bg-secondary/10 dark:bg-primary/10"
            textClassName="text-secondary dark:text-yellow-400"
            label={t('common.ok')}
            onPress={handleModalConfirm}
          />
        </View>
      </Modal>
    </View>
  );
}
