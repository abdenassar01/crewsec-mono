/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';
import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr';
import ViewShot from 'react-native-view-shot';

import {
  ActivityIndicator,
  Button,
  colors,
  Modal,
  Text,
  useModal,
  View,
} from '@/components/ui';

import { ParkingTicketPreview } from '../control-parking/new-dispute';
import { getUser } from '@/lib/storage/user-storage';
import { type ReferenceEntry } from './types-offline';
import {
  referenceDetailsStorage,
  syncStorage,
} from '@/services/vehicle-control-storage';

interface Props {
  control: Control<ReferenceEntry>;
}

export function ReceiptViewerModal({ control }: Props) {
  const { present, ref, dismiss } = useModal();
  const formData = useWatch<ReferenceEntry>({ control });
  const { t } = useTranslation();
  const shotRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const violationData = useSafeQuery(
    api.staticData.getLocationViolation,
    formData.violationId
      ? { id: formData.violationId as Id<'locationViolations'> }
      : 'skip',
  );

  const town = useSafeQuery(api.towns.get, {
    id: formData.townId as Id<'towns'>,
  });

  const generateUploadUrl = useSafeMutation(api.storage.generateUploadUrl);
  const getUrl = useSafeMutation(api.storage.getUrl);

  const createControlFee = useSafeMutation(api.controlFees.create);

  const handlePrintAndSubmit = async () => {
    const user = getUser();
    console.log('formData: ', formData);
    if (!formData.device) {
      showMessage({
        message: 'Please select a printer first',
        type: 'warning',
      });
      return;
    }
    if (!violationData) {
      showMessage({
        message: 'Could not find a price for the selected violation and town.',
        type: 'danger',
      });
      return;
    }
    if (!formData.violationId) {
      showMessage({
        message: 'Please select a violation',
        type: 'warning',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const uri = await shotRef.current.capture();

      let storageId: Id<'_storage'> | undefined;
      let dbSaveSuccess = false;

      try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'image/png' },
          body: blob,
        });

        if (!result.ok) {
          throw new Error('Failed to upload ticket image');
        }

        const json = await result.json();
        storageId = json.storageId;

        if (storageId) {
          try {
            const remoteUrl = await getUrl({ storageId });
            if (remoteUrl) {
              await BLEPrinter.printImage(remoteUrl);
              showMessage({ message: 'Printing started...', type: 'info' });
            } else {
              throw new Error('Could not retrieve image URL');
            }
          } catch (printError) {
            console.error('Printing error:', printError);
            showMessage({
              message: 'Printing failed, but saved to database.',
              type: 'warning',
            });
          }
        }

        await createControlFee({
          reference: formData.reference || '',
          mark: formData.mark || '',
          startDate: formData.startDate || Date.now(),
          endDate: formData.endDate || Date.now(),
          isSignsChecked: formData.isSignsChecked || false,
          isPhotosTaken: formData.isPhotosTaken || false,
          status: 'AWAITING',
          townId: (formData.townId as Id<'towns'>) || ('' as Id<'towns'>),
          locationViolationId:
            (formData.violationId as Id<'locationViolations'>) ||
            ('' as Id<'locationViolations'>),
          galleryStorageIds:
            (formData.galleryStorageIds as Id<'_storage'>[]) || [],
          ticketUrl: storageId,
        });
        dbSaveSuccess = true;
      } catch (error) {
        console.error('Upload/Save error:', error);
        showMessage({
          message: 'Network error. Cannot print or save to DB.',
          type: 'danger',
        });
      }

      const completedEntry: ReferenceEntry = {
        id: formData.id || '',
        reference: formData.reference || '',
        locationId:
          (formData.locationId as Id<'locations'>) || ('' as Id<'locations'>),
        townId: (formData.townId as Id<'towns'>) || ('' as Id<'towns'>),
        violationId:
          (formData.violationId as Id<'locationViolations'>) ||
          ('' as Id<'locationViolations'>),
        mark: formData.mark || '',
        galleryStorageIds: formData.galleryStorageIds || [],
        isSignsChecked: formData.isSignsChecked || false,
        isPhotosTaken: formData.isPhotosTaken || false,
        startDate: formData.startDate || Date.now(),
        endDate: formData.endDate || Date.now(),
        easyParkResponse: formData.easyParkResponse,
        ticketUrl: '',
        device: formData.device,
        createdAt: formData.createdAt || Date.now(),
        completedAt: Date.now(),
        userId: user?.userId || '',
      };

      referenceDetailsStorage.saveReferenceDetails(completedEntry);

      if (dbSaveSuccess) {
        showMessage({
          message: 'Control Fee saved to database!',
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Saved locally. Network error prevented database upload.',
          type: 'warning',
        });
        syncStorage.markForUpload(completedEntry.id);
      }

      dismiss();
    } catch (error) {
      console.error('Critical error during process:', error);
      showMessage({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        type: 'danger',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-row items-center justify-end">
      <Button
        disabled={isProcessing}
        label={t('control.preview')}
        onPress={present}
        textClassName="!text-xs"
      />
      <Modal ref={ref} snapPoints={['90%']} title="Receipt Preview">
        <View className="container w-full flex-row items-center justify-end gap-3 border-b border-gray-200 pb-2">
          <Button
            onPress={handlePrintAndSubmit}
            label={isProcessing ? 'Processing...' : 'Confirm & Print'}
            variant="default"
            className="w-[90%]"
            disabled={isProcessing}
          />
          <Button
            onPress={dismiss}
            className="bg-[#E80C10]/20 justify-center items-center size-10"
          >
            <Image
              className="size-6"
              source={require('assets/icons/cancel.png')}
            />
          </Button>
        </View>

        {isProcessing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text className="mt-2 text-secondary">Processing...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="p-2"
          >
            <ViewShot
              ref={shotRef}
              options={{ format: 'png', quality: 0.6, result: 'tmpfile' }}
            >
              <ParkingTicketPreview
                violation={violationData?.violation || null}
                town={town || null}
                locationViolation={violationData || null}
                formData={{
                  id: formData.id || '',
                  reference: formData.reference || '',
                  mark: formData.mark || '',
                  locationId: `${formData.locationId || ''}`,
                  townId: `${formData.townId || ''}`,
                  violationId: `${formData.violationId || ''}`,
                  galleryStorageIds: formData.galleryStorageIds || [],
                  isSignsChecked: formData.isSignsChecked,
                  isPhotosTaken: formData.isPhotosTaken,
                  startDate: formData.startDate || Date.now(),
                  endDate: formData.endDate || Date.now(),
                  easyParkResponse: formData.easyParkResponse,
                  device: formData.device,
                }}
              />
            </ViewShot>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}
