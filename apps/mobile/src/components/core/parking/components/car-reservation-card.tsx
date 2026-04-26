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
}

export function CarReservationCard({ vehicle }: Props) {
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
        />
      </Modal>
      <TouchableOpacity
        onPress={present}
        className="w-full overflow-hidden rounded-2xl bg-background-secondary dark:bg-background-secondary-dark"
      >
        <View className="flex-row items-center gap-3 bg-blue-600 px-4 py-3">
          <View className="items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-800 p-2">
            <Text className="text-xl font-black text-yellow-400">S</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-black tracking-wider text-white">
              {vehicle.reference.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/vehicle-control',
                params: { reference: vehicle.reference },
              });
            }}
            className="mr-2 items-center justify-center rounded-full bg-white/20 px-3 py-1.5"
          >
            <Ionicons name="document-text-outline" size={16} color="white" />
          </TouchableOpacity>
          <View
            className={`size-9 items-center justify-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
          >
            <Ionicons
              name={isActive ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color="white"
            />
          </View>
        </View>

        <View className="p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className={`size-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <Text
                className={`text-sm font-medium ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {isActive ? t('manage-parking.time-left') : t('forms.finished')}
              </Text>
            </View>
          </View>

          {parking && (
            <View className="mt-2 flex-row items-center gap-1.5">
              <Image
                className="size-3.5"
                source={
                  colorScheme === 'dark'
                    ? require('assets/icons/dark/security.png')
                    : require('assets/icons/light/security.png')
                }
              />
              <Text className="text-xs font-medium text-text dark:text-gray-200">
                {parking.name}
              </Text>
              {parking.address && (
                <Text className="text-[10px] text-gray-400">
                  - {parking.address}
                </Text>
              )}
            </View>
          )}

          <View className="mt-2 gap-1.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="arrow-up" size={11} color={success[500]} />
              <DateTimeFormatter time={vehicle.joinDate} className="text-[10px]" />
              {vehicle.leaveDate && (
                <>
                  <Ionicons name="arrow-down" size={11} color={danger[500]} />
                  <DateTimeFormatter
                    time={vehicle.leaveDate}
                    className="text-[10px]"
                  />
                </>
              )}
            </View>

            {(durationDays > 0 || durationHours > 0) && (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={11} color={secondary[500]} />
                <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                  {durationDays > 0
                    ? t('manage-parking.days', { nbr: durationDays })
                    : `${durationHours}h`}
                </Text>
              </View>
            )}
          </View>

          {parking?.workingHours && parking.workingHours.length > 0 && todayHours && (
            <View className="mt-2 flex-row items-center gap-1.5 rounded-lg bg-background px-2 py-1 dark:bg-background-dark">
              <Ionicons
                name="today-outline"
                size={10}
                color={colorScheme === 'dark' ? '#facc15' : secondary[500]}
              />
              <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                {todayHours.closed
                  ? t('parking-info.closed')
                  : `${todayHours.open} - ${todayHours.close}`}
              </Text>
            </View>
          )}

          {parking?.maxCapacity && (
            <View className="mt-1 flex-row items-center gap-1.5">
              <Ionicons name="grid-outline" size={10} color="#9ca3af" />
              <Text className="text-[10px] text-gray-400">
                {t('forms.capacity')}: {parking.maxCapacity}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
}
