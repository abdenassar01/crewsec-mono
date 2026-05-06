import { type Doc } from 'convex/_generated/dataModel';
import { useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { DateTimeFormatter } from '@/components/common';
import { Image, Text, TouchableOpacity, useModal, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';

import { CarParkingReservationModal } from './car-parking-reservation-modal';
import { EditItemSheet } from './edit-item-sheet';
import { danger, secondary, success } from '@/components/ui/colors';

interface ParkingInfo {
  _id: string;
  name?: string;
  address?: string;
  location?: string;
  description?: string;
  workingHours?: { day: string; open: string; close: string; closed?: boolean }[];
  phone?: string;
  maxCapacity?: number;
}

interface VehicleWithParking extends Doc<'vehicles'> {
  parking?: ParkingInfo;
}

interface Props {
  vehicle: VehicleWithParking;
  showControlFee?: boolean;
}

export function CarReservationSimpleCard({ vehicle, showControlFee = false }: Props) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { ref, present } = useModal();
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const parking = vehicle.parking;
  const now = Date.now();
  const isActive = vehicle.joinDate <= now && (!vehicle.leaveDate || vehicle.leaveDate >= now);
  const durationMs = (vehicle.leaveDate || now) - vehicle.joinDate;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationDays = Math.floor(durationHours / 24);

  const getTodayHours = () => {
    if (!parking?.workingHours?.length) return null;
    const dayName = moment().format('dddd');
    return parking.workingHours.find(
      (wh) => wh.day.toLowerCase() === dayName.toLowerCase(),
    );
  };

  const todayHours = getTodayHours();

  return (
    <>
      <EditItemSheet open={openEditModal} vehicle={vehicle} />
      <Modal ref={ref} snapPoints={['20%', '30%']}>
        <CarParkingReservationModal
          vehicle={vehicle}
          openEdit={() => setOpenEditModal(true)}
          showControlFee={showControlFee}
        />
      </Modal>
      <TouchableOpacity
        onPress={present}
        className="w-full rounded-2xl bg-background-secondary p-4 dark:bg-background-secondary-dark"
      >
        <View className="flex-row items-center overflow-hidden rounded-lg bg-background dark:bg-background-dark">
          <View className="justify-end bg-blue-600 p-2 pt-4">
            <Text className="text-white">s</Text>
          </View>
          <Text className="pl-2 text-center text-xl font-bold text-secondary dark:text-primary">
            {vehicle.reference}
          </Text>
        </View>
        <View className="mt-2 gap-2">
          <View className="flex-row">
            <Image
              className="w-5 h-5"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/join.png')
                  : require('assets/icons/light/join.png')
              }
            />
            <DateTimeFormatter time={vehicle.joinDate} className="text-xxs" />
          </View>

          <View className="flex-row">
            <Image
              className="w-5 h-5"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/leave.png')
                  : require('assets/icons/light/leave.png')
              }
            />

            {vehicle.leaveDate && (
              <DateTimeFormatter
                time={vehicle.leaveDate}
                className="text-xxs"
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}
