/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, TextInput } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { Header, RootWrapper } from '@/components/common';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  colors,
} from '@/components/ui';
import { useUser } from '@/hooks';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';

interface WorkingDay {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { day: 'Monday', open: '08:00', close: '18:00' },
  { day: 'Tuesday', open: '08:00', close: '18:00' },
  { day: 'Wednesday', open: '08:00', close: '18:00' },
  { day: 'Thursday', open: '08:00', close: '18:00' },
  { day: 'Friday', open: '08:00', close: '18:00' },
  { day: 'Saturday', open: '09:00', close: '14:00' },
  { day: 'Sunday', open: '09:00', close: '14:00', closed: true },
];

export function ParkingInfoScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  const parking = useSafeQuery(api.parkings.getMyParking);
  const updateParkingInfo = useSafeMutation(api.parkings.updateParkingInfo);

  const [workingHours, setWorkingHours] = useState<WorkingDay[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (parking?.parking) {
      const p = parking.parking;
      setWorkingHours(
        p.workingHours && p.workingHours.length > 0
          ? p.workingHours
          : DEFAULT_WORKING_HOURS,
      );
      setPhone(p.phone || '');
      setEmail(p.email || '');
      setMaxCapacity(p.maxCapacity?.toString() || '');
      setInstructions(p.instructions || '');
    }
  }, [parking]);

  if (parking === undefined) {
    return (
      <View className=" items-center justify-center">
        <ActivityIndicator color={colors.secondary} size={50} />
      </View>
    );
  }

  if (!parking?.parking) {
    return (
      <View className=" items-center justify-center p-4">
        <Text className="text-center text-text dark:text-gray-100">
          {t('parking-info.not-found')}
        </Text>
      </View>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateParkingInfo({
      parkingId: parking.parking._id,
      workingHours,
      phone: phone || undefined,
      email: email || undefined,
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
      instructions: instructions || undefined,
    });
    setIsSaving(false);

    if (result !== null) {
      showMessage({
        type: 'success',
        message: t('parking-info.save-success'),
      });
      setIsEditing(false);
    }
  };

  const handleToggleDay = (index: number) => {
    if (!isEditing) return;
    setWorkingHours((prev) =>
      prev.map((wh, i) =>
        i === index ? { ...wh, closed: !wh.closed } : wh,
      ),
    );
  };

  const handleTimeChange = (
    index: number,
    field: 'open' | 'close',
    value: string,
  ) => {
    setWorkingHours((prev) =>
      prev.map((wh, i) => (i === index ? { ...wh, [field]: value } : wh)),
    );
  };

  return (
    <View className="">
      <Header title={t('parking-info.title')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {parking.parking.imageUrl ? (
          <Image
            className="mb-3 h-40 w-full rounded-2xl"
            source={{ uri: parking.parking.imageUrl }}
          />
        ) : null}

        <View className="w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Image
              className="size-5"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/security.png')
                  : require('assets/icons/light/security.png')
              }
            />
            <Text className="text-lg font-bold text-secondary dark:text-yellow-400">
              {parking.parking.name}
            </Text>
          </View>
          <Text className="text-xs text-text dark:text-gray-100">
            {parking.parking.description}
          </Text>
          {parking.parking.address ? (
            <Text className="mt-1 text-xs text-text dark:text-gray-300">
              {parking.parking.address}
            </Text>
          ) : null}
          {parking.parking.website ? (
            <Text className="mt-1 text-xs text-blue-500">
              {parking.parking.website}
            </Text>
          ) : null}
        </View>

        <View className='w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3'>
          <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
            {t('parking-info.working-hours')}
          </Text>
          {workingHours.map((wh, index) => (
            <View
              key={wh.day}
              className="mb-2 flex-row items-center justify-between"
            >
              <TouchableOpacity
                onPress={() => handleToggleDay(index)}
                className="w-24"
                disabled={!isEditing}
              >
                <Text
                  className={`text-sm ${wh.closed ? 'text-gray-400 line-through dark:text-gray-600' : 'font-semibold text-text dark:text-white'}`}
                >
                  {wh.day}
                </Text>
              </TouchableOpacity>
              {isEditing && !wh.closed ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    className="w-16 rounded-lg bg-white px-2 py-1 text-center text-xs dark:bg-gray-800 dark:text-white"
                    value={String(wh.open ?? '')}
                    onChangeText={(v) => handleTimeChange(index, 'open', v)}
                    placeholder="08:00"
                    keyboardType="number-pad"
                  />
                  <Text className="text-xs text-gray-400">-</Text>
                  <TextInput
                    className="w-16 rounded-lg bg-white px-2 py-1 text-center text-xs dark:bg-gray-800 dark:text-white"
                    value={String(wh.close ?? '')}
                    onChangeText={(v) => handleTimeChange(index, 'close', v)}
                    placeholder="18:00"
                    keyboardType="number-pad"
                  />
                </View>
              ) : (
                <Text
                  className={`text-xs ${wh.closed ? 'text-gray-400 dark:text-gray-600' : 'text-text dark:text-gray-100'}`}
                >
                  {wh.closed
                    ? t('parking-info.closed')
                    : `${wh.open} - ${wh.close}`}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View className="w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3">
          <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
            {t('parking-info.general-info')}
          </Text>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
              {t('forms.phone')}
            </Text>
            {isEditing ? (
              <TextInput
                className=" rounded-lg bg-white px-2 py-1 text-xs dark:bg-gray-800 dark:text-white"
                value={phone}
                onChangeText={setPhone}
                placeholder="+46 ..."
                keyboardType="phone-pad"
              />
            ) : (
              <Text className=" text-xs text-text dark:text-gray-100">
                {phone || t('not-found')}
              </Text>
            )}
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
              {t('forms.email')}
            </Text>
            {isEditing ? (
              <TextInput
                className=" rounded-lg bg-white px-2 py-1 text-xs dark:bg-gray-800 dark:text-white"
                value={email}
                onChangeText={setEmail}
                placeholder="info@parking.se"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text className=" text-xs text-text dark:text-gray-100">
                {email || t('not-found')}
              </Text>
            )}
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
              {t('forms.capacity')}
            </Text>
            {isEditing ? (
              <TextInput
                className="w-16 rounded-lg bg-white px-2 py-1 text-xs dark:bg-gray-800 dark:text-white"
                value={maxCapacity}
                onChangeText={setMaxCapacity}
                placeholder="50"
                keyboardType="number-pad"
              />
            ) : (
              <Text className="text-xs text-text dark:text-gray-100">
                {maxCapacity ? `${maxCapacity}` : t('not-found')}
              </Text>
            )}
          </View>
        </View>

        {parking.parking.instructions || isEditing ? (
          <View className='w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3'>
            <Text className="mb-2 text-base font-bold text-secondary dark:text-yellow-400">
              {t('parking-info.instructions')}
            </Text>
            {isEditing ? (
              <TextInput
                className="w-full rounded-lg bg-white p-2 text-xs dark:bg-gray-800 dark:text-white"
                value={instructions}
                onChangeText={setInstructions}
                placeholder={t('parking-info.instructions-placeholder')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text className="text-xs text-text dark:text-gray-100">
                {parking.parking.instructions || t('not-found')}
              </Text>
            )}
          </View>
        ) : null}

        {isAdmin && (
          <View className="mb-6 mt-2">
            {isEditing ? (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  className=" items-center rounded-xl bg-gray-200 p-3 dark:bg-gray-700"
                >
                  <Text className="font-bold text-text dark:text-white">
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                  className=" items-center rounded-xl bg-secondary p-3"
                >
                  <Text className="font-bold text-white">
                    {isSaving
                      ? t('forms.updating')
                      : t('common.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="items-center rounded-xl bg-secondary p-3"
              >
                <Text className="font-bold text-white">
                  {t('parking-info.edit')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
