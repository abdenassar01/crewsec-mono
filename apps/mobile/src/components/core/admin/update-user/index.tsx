/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { type Id } from 'convex/_generated/dataModel';
import { t } from 'i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  KeyboardAvoidingView,
} from 'react-native-keyboard-controller';

import { Button, colors } from '@/components/ui';
import {
  updateUserFormSchema,
  type UpdateUserFormValues,
} from '@/lib/types/update-user-form';

import {
  AddUserFirstStep,
  AddUserSecondStep,
  AddUserThirdStep,
} from '../add-user';

export { DeleteUserModal } from './delete-user';

interface ParkingWithUser {
  _id: Id<'parkings'>;
  _creationTime: number;
  name: string;
  description: string;
  location: string;
  imageStorageId?: Id<'_storage'>;
  website?: string;
  address: string;
  userId: Id<'users'>;
  unresolvedMakuleras?: number;
  unresolvedFelparkering?: number;
  imageUrl?: string | null;
  user?: {
    _id: Id<'users'>;
    _creationTime: number;
    email: string;
    name: string;
    phone?: string;
    avatar?: Id<'_storage'>;
    role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
    enabled?: boolean;
    userId: string;
  } | null;
}

interface Props {
  pending: boolean;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
  parking?: ParkingWithUser | null;
  onSubmit?: (_data: UpdateUserFormValues) => Promise<void>;
}

export function UpdateClientParkingForm({
  currentStep,
  pending,
  setCurrentStep,
  onSubmit,
  parking,
}: Props) {
  const { height: _height } = useWindowDimensions();

  const { control, handleSubmit, trigger } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      address: parking?.address || '',
      description: parking?.description || '',
      email: parking?.user?.email || '',
      image: parking?.imageStorageId || '',
      name: parking?.user?.name || parking?.name || '',
      phone: parking?.user?.phone || '',
      location: parking?.location || '',
      website: parking?.website || '',
      parkingName: parking?.name || '',
      role: parking?.user?.role || 'CLIENT',
    },
  });

  function next() {
    switch (currentStep) {
      case 1:
        trigger(['email', 'name', 'phone']).then(
          (valid) => valid && setCurrentStep((prev) => prev + 1),
        );
        break;
      case 2:
        trigger(['image', 'parkingName', 'website', 'description']).then(
          (valid) => valid && setCurrentStep((prev) => prev + 1),
        );
        break;
      default:
        break;
    }
  }

  const getStep = () => {
    switch (currentStep) {
      case 1:
        return <AddUserFirstStep control={control} />;
      case 2:
        return <AddUserSecondStep control={control} />;
      case 3:
        return <AddUserThirdStep control={control} />;
      default:
        return null;
    }
  };

  if (pending) {
    return (
      <View className="w-full items-center justify-center">
        <ActivityIndicator size={50} color={colors.secondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={10}
      className=""
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: _height - 240 }}>{getStep()}</View>
      </ScrollView>
      <View className="flex-row justify-end gap-[2%]">
        {currentStep !== 1 && (
          <Button
            className="w-[49%]"
            onPress={() => setCurrentStep((prev) => prev - 1)}
            label={t('forms.prev')}
          />
        )}
        <Button
          className="w-[49%]"
          onPress={
            currentStep === 3
              ? handleSubmit(async (data) => {
                  if (onSubmit) {
                    await onSubmit(data);
                  }
                })
              : next
          }
          label={currentStep === 3 ? t('forms.submit') : t('forms.next')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
