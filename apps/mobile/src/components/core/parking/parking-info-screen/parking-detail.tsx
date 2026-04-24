import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ScrollView, View } from 'react-native';

import { Header } from '@/components/common';
import { ActivityIndicator, Text, colors } from '@/components/ui';
import { useUser } from '@/hooks';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';

import { ParkingEditActions } from './parking-edit-actions';
import { ParkingGeneralInfoEdit, ParkingGeneralInfoView, ParkingInstructionsView } from './parking-general-info';
import { ParkingHeaderCard } from './parking-header-card';
import { ParkingWorkingHours } from './parking-working-hours';
import { DEFAULT_WORKING_HOURS, type ParkingInfoFormValues, parkingInfoSchema } from './shared';

interface ParkingDetailProps {
  parkingId: Id<'parkings'>;
  onBack: () => void;
}

export function ParkingDetail({ parkingId, onBack }: ParkingDetailProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE' || user?.role === 'SUPER_ADMIN';

  const parking = useSafeQuery(api.parkings.getParkingInfo, { parkingId });
  const updateParkingInfo = useSafeMutation(api.parkings.updateParkingInfo);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, setValue, watch } = useForm<ParkingInfoFormValues>({
    resolver: zodResolver(parkingInfoSchema),
    defaultValues: {
      phone: '',
      email: '',
      maxCapacity: '',
      instructions: '',
      workingHours: DEFAULT_WORKING_HOURS,
    },
  });

  useEffect(() => {
    if (parking) {
      reset({
        phone: parking.phone || '',
        email: parking.email || '',
        maxCapacity: parking.maxCapacity?.toString() || '',
        instructions: parking.instructions || '',
        workingHours:
          parking.workingHours && parking.workingHours.length > 0
            ? parking.workingHours.map((wh: any) => ({
                day: String(wh.day ?? ''),
                open: String(wh.open ?? ''),
                close: String(wh.close ?? ''),
                closed: wh.closed ?? false,
              }))
            : DEFAULT_WORKING_HOURS,
      });
    }
  }, [parking, reset]);

  if (parking === undefined) {
    return (
      <View className="items-center justify-center">
        <ActivityIndicator color={colors.secondary} size={50} />
      </View>
    );
  }

  if (!parking) {
    return (
      <View className="items-center justify-center p-4">
        <Text className="text-center text-text dark:text-gray-100">
          {t('parking-info.not-found')}
        </Text>
      </View>
    );
  }

  const onSubmit = async (data: ParkingInfoFormValues) => {
    setIsSaving(true);
    const result = await updateParkingInfo({
      parkingId: parking._id,
      workingHours: data.workingHours,
      phone: data.phone || undefined,
      email: data.email || undefined,
      maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity, 10) : undefined,
      instructions: data.instructions || undefined,
    });
    setIsSaving(false);

    if (result !== null) {
      showMessage({ type: 'success', message: t('parking-info.save-success') });
      setIsEditing(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding'>
      <Header title={parking.name || t('parking-info.title')} onBack={onBack} />
      <ScrollView
        
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 48 }}
      >
        <ParkingHeaderCard
          imageUrl={parking.imageUrl}
          name={parking.name}
          description={parking.description}
          address={parking.address}
          website={parking.website}
        />

        <ParkingWorkingHours
          control={control}
          isEditing={isEditing}
          setValue={setValue}
          watch={watch}
        />

        {isEditing ? (
          <ParkingGeneralInfoEdit control={control} />
        ) : (
          <>
            <ParkingGeneralInfoView
              phone={parking.phone}
              email={parking.email}
              maxCapacity={parking.maxCapacity}
            />
            <ParkingInstructionsView instructions={parking.instructions} />
          </>
        )}

        <ParkingEditActions
          isEditing={isEditing}
          isSaving={isSaving}
          canEdit={canEdit}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            reset();
            setIsEditing(false);
          }}
          onSave={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
