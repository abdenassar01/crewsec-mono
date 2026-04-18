/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Header, ImageGalleryItem, RootWrapper } from '@/components/common';
import { ControlledInput, View } from '@/components/ui';

import { EasyparkCheckReference } from '../control-fee';
import {
  LocationSelect,
  PrinterSection,
  TownSelect,
  VehicleSelect,
  ViolationSelect,
  YesNoQuestions,
} from '../control-parking';
import { ReceiptViewerModal } from './receipt-viewer-modal';
import { SharedTimerDisplay } from './shared-timer-display';
import { type VehicleControlItem, vehicleControlItemSchema } from './types';

interface VehicleControlDetailFormProps {
  item: VehicleControlItem;
  onBack: () => void;
  // onUpdate: (item: VehicleControlItem) => void;
  startTime: number | null;
}

export function VehicleControlDetailForm({
  item,
  onBack,
  startTime,
}: VehicleControlDetailFormProps) {
  // console.log('🚀 ~ VehicleControlDetailForm ~ onUpdate:', onUpdate);
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const { control } = useForm<VehicleControlItem>({
    resolver: zodResolver(vehicleControlItemSchema),
    defaultValues: {
      ...item,
      startDate: item.startDate || startTime || undefined,
    },
  });

  return (
    <RootWrapper className="container">
      <Header
        title={`${t('parking.vehicle-control')} - ${item.reference}`}
        onBack={onBack}
      />
      <ScrollView
        className="mt-3"
        showsVerticalScrollIndicator={false}
        style={{ height: height - (Platform.OS === 'android' ? 200 : 220) }}
      >
        <KeyboardAvoidingView>
          <View className="flex-row justify-between">
            <ControlledInput
              label={t('forms.reference')}
              placeholder={t('forms.reference')}
              wrapperClassName="w-full"
              control={control}
              name="reference"
              editable={false}
            />
          </View>
          <View className="flex-row justify-between">
            <VehicleSelect control={control} name="mark" className="w-[48%]" />
            <LocationSelect
              control={control}
              name="locationId"
              className="w-[48%]"
            />
          </View>
          <View className="flex-row justify-between">
            <TownSelect control={control} name="townId" className="w-[48%]" />
            <ViolationSelect
              control={control}
              name="violationId"
              className="w-[48%]"
            />
          </View>
          <EasyparkCheckReference name="easyParkResponse" control={control} />

          {/* Display the shared timer */}
          {startTime && (
            <SharedTimerDisplay
              control={control}
              startTime={startTime}
              startDateName="startDate"
            />
          )}

          <ImageGalleryItem
            control={control}
            name="galleryStorageIds"
            label={t('forms.gallery')}
          />
          <YesNoQuestions control={control} />
          <PrinterSection control={control} />
        </KeyboardAvoidingView>
      </ScrollView>
      <View className="mt-2 flex-row items-center justify-end gap-2">
        <ReceiptViewerModal control={control} />
      </View>
    </RootWrapper>
  );
}
