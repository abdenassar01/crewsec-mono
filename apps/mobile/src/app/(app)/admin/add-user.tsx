/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import { Header, RootWrapper } from '@/components/common';
import {
  ClientParkingForm,
  RoleSelectionStep,
  SimpleUserForm,
} from '@/components/core';
import { View } from '@/components/ui';

type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'SUPER_ADMIN' | null;

export default function AddUser() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createUserMutation = useSafeMutation(api.users.create);
  const createUserAndParkingMutation = useSafeMutation(
    api.parkings.createUserAndParking,
  );

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const handleSimpleUserSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      await createUserMutation({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        avatar: data.avatar || undefined,
      });

      showMessage({ message: 'User created successfully', type: 'success' });
      setSelectedRole(null);
    } catch (err) {
      console.error('Error creating user:', err);
      showMessage({
        message: 'Failed to create user. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientParkingSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      await createUserAndParkingMutation({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'CLIENT',
        parkingName: data.parkingName,
        parkingDescription: data.description,
        parkingLocation: data.location,
        parkingWebsite: data.website || '',
        parkingAddress: data.address,
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity, 10) : undefined,
        imageStorageId: data.image || undefined,
        organizationId: data.organizationId || undefined,
      });

      showMessage({
        message: 'User and parking created successfully',
        type: 'success',
      });
      setSelectedRole(null);
    } catch (err) {
      console.error('Error creating user and parking:', err);
      showMessage({
        message: 'Failed to create user and parking. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!selectedRole) {
      return <RoleSelectionStep onRoleSelect={handleRoleSelect} />;
    }

    if (selectedRole === 'CLIENT') {
      return (
        <ClientParkingForm
          onSubmit={handleClientParkingSubmit}
          onBack={handleBack}
          pending={isSubmitting}
        />
      );
    }

    return (
      <SimpleUserForm
        selectedRole={selectedRole}
        onSubmit={handleSimpleUserSubmit}
        onBack={handleBack}
        pending={isSubmitting}
      />
    );
  };

  return (
    <RootWrapper className="container">
      <Header title={t('add-user.title')} />
      <View className="">{renderContent()}</View>
    </RootWrapper>
  );
}
