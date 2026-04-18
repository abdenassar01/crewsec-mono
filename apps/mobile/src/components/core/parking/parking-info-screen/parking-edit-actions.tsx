import { type UseFormHandleSubmit } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { type ParkingInfoFormValues } from './shared';

interface ParkingEditActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ParkingEditActions({
  isEditing,
  isSaving,
  canEdit,
  onEdit,
  onCancel,
  onSave,
}: ParkingEditActionsProps) {
  const { t } = useTranslation();

  if (!canEdit) return null;

  return (
    <View className="mb-6 mt-2">
      {isEditing ? (
        <View className="flex-row justify-between">
          <Button
            className="w-[48%]"
            onPress={onCancel}
            label={t('cancel')}
            variant="secondary"
          />
          <Button
            className="w-[48%]"
            onPress={onSave}
            disabled={isSaving}
            label={isSaving ? t('forms.updating') : t('common.save')}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={onEdit}
          className="items-center rounded-xl bg-secondary p-3"
        >
          <Text className="font-bold text-white">
            {t('parking-info.edit')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
