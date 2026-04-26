/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Button, ControlledSelect, Text } from '@/components/ui';
import { api } from 'convex/_generated/api';
import { type Doc } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';

import { AddUserFirstStep, AddUserSecondStep, AddUserThirdStep } from './steps';

const clientParkingFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  parkingName: z.string().min(1, 'Parking name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  address: z.string().min(1, 'Address is required'),
  maxCapacity: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'CLIENT']).default('CLIENT'),
  organizationId: z.string().optional(),
});

export type ClientParkingFormValues = z.infer<typeof clientParkingFormSchema>;

interface Props {
  onSubmit?: (_data: ClientParkingFormValues) => Promise<void>;
  onBack?: () => void;
  pending?: boolean;
}

export function ClientParkingForm({
  onSubmit,
  onBack,
  pending = false,
}: Props) {
  const { height: _height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  const currentUser = useSafeQuery(api.users.getCurrentUserProfile);
  const organizations = useSafeQuery(api.organizations.list);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const orgList = organizations ?? [];

  const orgOptions = orgList.map((org: { name: string; _id: string }) => ({
    label: org.name,
    value: org._id,
  }));

  const { control, handleSubmit, trigger } = useForm<ClientParkingFormValues>({
    resolver: zodResolver(clientParkingFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      parkingName: '',
      description: '',
      location: '',
      website: '',
      address: '',
      maxCapacity: '',
      image: '',
      role: 'CLIENT',
      organizationId: '',
    },
  });

  function next() {
    switch (currentStep) {
      case 1:
        trigger(['email', 'password', 'name', 'phone']).then(
          (valid) => valid && setCurrentStep((prev) => prev + 1),
        );
        break;
      case 2:
        trigger(['parkingName', 'website', 'description'])
          .then((valid) => valid && setCurrentStep((prev) => prev + 1))
          .catch((e) => console.log('Not Valid: ', e));
        break;
      default:
        break;
    }
  }

  const getStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <AddUserFirstStep control={control} />
            {isSuperAdmin && orgOptions.length > 0 && (
              <ControlledSelect
                label="Organization"
                control={control}
                name="organizationId"
                options={orgOptions}
                placeholder="Select organization"
              />
            )}
          </>
        );
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
      <View className=" mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-purple-500/10 p-2">
        <ActivityIndicator size={24} color="#a855f7" />
        <Text className="text-xs text-purple-500">
          Creating Account and Parking...
        </Text>
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
        <View style={{ height: _height - 150 }} className="p-4">
          {getStep()}
        </View>
      </ScrollView>
      <View className="flex-row justify-between px-4">
        <Button
          className="w-[49%]"
          onPress={() =>
            currentStep === 1
              ? onBack && onBack()
              : setCurrentStep((prev) => prev - 1)
          }
          label="Previous"
        />

        <Button
          className="w-[49%]"
          onPress={
            currentStep === 3
              ? handleSubmit(async (data) => {
                  if (onSubmit) {
                    await onSubmit({
                      ...data,
                    });
                  }
                })
              : next
          }
          label={
            currentStep === 3
              ? pending
                ? 'Creating...'
                : 'Create Account'
              : 'Next'
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
