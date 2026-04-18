/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { type Id } from 'convex/_generated/dataModel';

import { Header } from '@/components/common';
import {
  ActivityIndicator,
  Button,
  ControlledInput,
  Image,
  Input,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  colors,
} from '@/components/ui';
import { useUser } from '@/hooks';
import { useSafeMutation, useSafeQuery } from '@/hooks/use-convex-hooks';
import { FlashList } from '@shopify/flash-list';
import { useWindowDimensions } from 'react-native';
import { primary } from '@/components/ui/colors';
import { truncateString } from '@/lib';

const workingDaySchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
  closed: z.boolean().optional(),
});

const parkingInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  maxCapacity: z.string().optional(),
  instructions: z.string().optional(),
  workingHours: z.array(workingDaySchema),
});

type ParkingInfoFormValues = z.infer<typeof parkingInfoSchema>;

const DEFAULT_WORKING_HOURS = [
  { day: 'Monday', open: '08:00', close: '18:00', closed: false },
  { day: 'Tuesday', open: '08:00', close: '18:00', closed: false },
  { day: 'Wednesday', open: '08:00', close: '18:00', closed: false },
  { day: 'Thursday', open: '08:00', close: '18:00', closed: false },
  { day: 'Friday', open: '08:00', close: '18:00', closed: false },
  { day: 'Saturday', open: '09:00', close: '14:00', closed: false },
  { day: 'Sunday', open: '09:00', close: '14:00', closed: true },
];

function ParkingList({
  onSelect,
}: {
  onSelect: (id: Id<'parkings'>) => void;
}) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [searchText, setSearchText] = useState('');
  const data = useSafeQuery(api.parkings.list, { query: searchText });

  if (data === undefined && !searchText) {
    return (
      <View className="mt-3 w-full items-center justify-center rounded-xl bg-white p-4 dark:bg-background-secondary-dark">
        <ActivityIndicator size={40} color={primary} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="mt-5 items-center">
        <Text className="text-center font-bold text-secondary">
          {t('admin.no-users')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ height: height - 140 }}
    >
      <Input
        value={searchText}
        placeholder={`${t('forms.query')}...`}
        onChangeText={(text: string) => setSearchText(text)}
      />
      <FlashList
        data={data}
        numColumns={2}
        contentContainerClassName="gap-2 pb-20"
        keyExtractor={(item) => item._id}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => onSelect(item.item._id)}
            className="mb-2 rounded-xl border border-secondary/10 bg-background-secondary p-1 dark:bg-background-secondary-dark"
          >
            <Image
              source={{ uri: item.item.imageUrl || undefined }}
              className="aspect-video w-full rounded-lg"
            />
            <View className="p-1">
              <Text className="font-bold text-secondary" numberOfLines={1}>
                {item.item.name}
              </Text>
              <Text className="text-xs" numberOfLines={1}>
                {truncateString(item.item.address, 20)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

function ParkingDetail({
  parkingId,
  onBack,
}: {
  parkingId: Id<'parkings'>;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

  const parking = useSafeQuery(api.parkings.getParkingInfo, { parkingId });
  const updateParkingInfo = useSafeMutation(api.parkings.updateParkingInfo);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<ParkingInfoFormValues>({
      resolver: zodResolver(parkingInfoSchema),
      defaultValues: {
        phone: '',
        email: '',
        maxCapacity: '',
        instructions: '',
        workingHours: DEFAULT_WORKING_HOURS,
      },
    });

  const { fields } = useFieldArray({
    control,
    name: 'workingHours',
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
      <View className=" items-center justify-center">
        <ActivityIndicator color={colors.secondary} size={50} />
      </View>
    );
  }

  if (!parking) {
    return (
      <View className=" items-center justify-center p-4">
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
      showMessage({
        type: 'success',
        message: t('parking-info.save-success'),
      });
      setIsEditing(false);
    }
  };

  const handleToggleDay = (index: number) => {
    const current = watch(`workingHours.${index}.closed`) ?? false;
    setValue(`workingHours.${index}.closed`, !current);
  };

  const cardClass =
    'w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3';

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
      <Header title={parking.name || t('parking-info.title')} onBack={onBack} />
      <ScrollView className="container mt-2" showsVerticalScrollIndicator={false}>
        {parking.imageUrl ? (
          <Image
            className="mb-3 h-40 w-full rounded-2xl"
            source={{ uri: parking.imageUrl }}
          />
        ) : null}

        <View className={cardClass}>
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
              {parking.name}
            </Text>
          </View>
          <Text className="text-xs text-text dark:text-gray-100">
            {parking.description}
          </Text>
          {parking.address ? (
            <Text className="mt-1 text-xs text-text dark:text-gray-300">
              {parking.address}
            </Text>
          ) : null}
          {parking.website ? (
            <Text className="mt-1 text-xs text-blue-500">
              {parking.website}
            </Text>
          ) : null}
        </View>

        <View className={cardClass}>
          <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
            {t('parking-info.working-hours')}
          </Text>
          {fields.map((field, index) => {
            const wh = watch(`workingHours.${index}`);
            const isClosed = wh?.closed ?? false;
            return (
              <View
                key={field.id}
                className="mb-2 flex-row items-center justify-between"
              >
                <TouchableOpacity
                  onPress={() => isEditing && handleToggleDay(index)}
                  className="w-24"
                >
                  <Text
                    className={`text-sm ${isClosed ? 'text-gray-400 line-through dark:text-gray-600' : 'font-semibold text-text dark:text-white'}`}
                  >
                    {field.day}
                  </Text>
                </TouchableOpacity>
                {isEditing && !isClosed ? (
                  <View className="flex-row items-center gap-2">
                    <ControlledInput
                      control={control}
                      name={`workingHours.${index}.open`}
                      placeholder="08:00"
                      keyboardType="number-pad"
                      wrapperClassName="mb-0"
                    />
                    <Text className="text-xs text-gray-400">-</Text>
                    <ControlledInput
                      control={control}
                      name={`workingHours.${index}.close`}
                      placeholder="18:00"
                      keyboardType="number-pad"
                      wrapperClassName="mb-0"
                    />
                  </View>
                ) : (
                  <Text
                    className={`text-xs ${isClosed ? 'text-gray-400 dark:text-gray-600' : 'text-text dark:text-gray-100'}`}
                  >
                    {isClosed
                      ? t('parking-info.closed')
                      : `${wh?.open ?? ''} - ${wh?.close ?? ''}`}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {isEditing ? (
          <View className={cardClass}>
            <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
              {t('parking-info.general-info')}
            </Text>

            <ControlledInput
              control={control}
              name="phone"
              label={t('forms.phone')}
              placeholder="+46 ..."
              keyboardType="phone-pad"
            />

            <ControlledInput
              control={control}
              name="email"
              label={t('forms.email')}
              placeholder="info@parking.se"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ControlledInput
              control={control}
              name="maxCapacity"
              label={t('forms.capacity')}
              placeholder="50"
              keyboardType="number-pad"
            />

            <ControlledInput
              control={control}
              name="instructions"
              label={t('parking-info.instructions')}
              placeholder={t('parking-info.instructions-placeholder')}
              multiline
              numberOfLines={4}
            />
          </View>
        ) : (
          <View className={cardClass}>
            <Text className="mb-3 text-base font-bold text-secondary dark:text-yellow-400">
              {t('parking-info.general-info')}
            </Text>

            <View className="mb-2 flex-row items-center gap-2">
              <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
                {t('forms.phone')}
              </Text>
              <Text className="text-xs text-text dark:text-gray-100">
                {parking.phone || t('not-found')}
              </Text>
            </View>

            <View className="mb-2 flex-row items-center gap-2">
              <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
                {t('forms.email')}
              </Text>
              <Text className="text-xs text-text dark:text-gray-100">
                {parking.email || t('not-found')}
              </Text>
            </View>

            <View className="mb-2 flex-row items-center gap-2">
              <Text className="w-24 text-xs font-semibold text-text dark:text-gray-300">
                {t('forms.capacity')}
              </Text>
              <Text className="text-xs text-text dark:text-gray-100">
                {parking.maxCapacity
                  ? `${parking.maxCapacity}`
                  : t('not-found')}
              </Text>
            </View>
          </View>
        )}

        {parking.instructions && !isEditing && (
          <View className={cardClass}>
            <Text className="mb-2 text-base font-bold text-secondary dark:text-yellow-400">
              {t('parking-info.instructions')}
            </Text>
            <Text className="text-xs text-text dark:text-gray-100">
              {parking.instructions}
            </Text>
          </View>
        )}

        {canEdit && (
          <View className="mb-6 mt-2">
            {isEditing ? (
              <View className="flex-row gap-2">
                <Button
                  className=""
                  onPress={() => {
                    reset();
                    setIsEditing(false);
                  }}
                  label={t('cancel')}
                  variant="secondary"
                />
                <Button
                  className=""
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  label={isSaving ? t('forms.updating') : t('common.save')}
                />
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

        <View className="h-24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ParkingInfoScreen() {
  const { t } = useTranslation();
  const [selectedParking, setSelectedParking] = useState<Id<'parkings'> | null>(null);

  if (selectedParking) {
    return (
      <ParkingDetail
        parkingId={selectedParking}
        onBack={() => setSelectedParking(null)}
      />
    );
  }

  return (
    <View className="">
      <Header title={t('parking-info.title')} />
      <View className="container mt-2">
        <ParkingList onSelect={setSelectedParking} />
      </View>
    </View>
  );
}
