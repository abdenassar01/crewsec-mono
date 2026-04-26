/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Doc, type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { ScrollView } from 'react-native-gesture-handler';

import {
  ActivityIndicator,
  Button,
  ControlledInput,
  Text,
  View,
} from '@/components/ui';
import { Modal } from '@/components/ui/modal';

interface Props {
  modalRef: React.RefObject<any>;
  vehicle: Doc<'vehicles'>;
  reference: string;
}

interface FormValues {
  mark: string;
  townId: string;
  locationViolationId: string;
  townSearch: string;
  violationSearch: string;
}

export function ControlFeeFromCardModal({ modalRef, vehicle, reference }: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      mark: '',
      townId: '',
      locationViolationId: '',
      townSearch: '',
      violationSearch: '',
    },
  });

  const townId = watch('townId');
  const townSearch = watch('townSearch');
  const violationSearch = watch('violationSearch');

  const towns = useSafeQuery(api.staticData.listTowns, { search: townSearch || undefined });
  const locationViolations = useSafeQuery(api.staticData.listLocationViolations, {
    locationId: undefined,
    violationId: undefined,
  });

  const filteredViolations = violationSearch
    ? (locationViolations || []).filter((lv: any) =>
        lv.label?.toLowerCase().includes(violationSearch.toLowerCase()),
      )
    : locationViolations || [];

  const createFromVehicle = useSafeMutation(api.controlFees.createFromVehicle);

  const onSubmit = async (data: FormValues) => {
    if (!data.townId) {
      showMessage({ message: 'Please select a town', type: 'warning' });
      return;
    }
    if (!data.locationViolationId) {
      showMessage({ message: 'Please select a violation', type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createFromVehicle({
        reference,
        mark: data.mark,
        townId: data.townId as Id<'towns'>,
        locationViolationId: data.locationViolationId as Id<'locationViolations'>,
        vehicleId: vehicle._id as Id<'vehicles'>,
      });
      showMessage({ message: 'Control fee created successfully', type: 'success' });
    } catch (error: any) {
      showMessage({
        message: error.message || 'Failed to create control fee',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef} snapPoints={['60%', '80%']} title={t('control.create-fee')}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-8"
        className="container"
      >
        <View className="flex-row items-center justify-between rounded-lg bg-background p-3 dark:bg-background-dark">
          <Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
            {t('manage-parking.reference')}
          </Text>
          <Text className="text-lg font-bold uppercase text-secondary dark:text-yellow-400">
            {reference}
          </Text>
        </View>

        <ControlledInput
          control={control}
          name="mark"
          label={t('forms.mark')}
          placeholder={t('forms.mark')}
        />

        <View>
          <Text className="mb-1 text-xs font-medium">
            {t('control.select-town')}
          </Text>
          <ControlledInput
            control={control}
            name="townSearch"
            placeholder={t('control.search-town')}
            onChangeText={() => setValue('townId', '')}
          />
          {towns === undefined && (
            <ActivityIndicator size="small" className="mt-2" />
          )}
          {towns?.length === 0 && townSearch && (
            <Text className="mt-1 text-xs text-gray-400">
              No towns found
            </Text>
          )}
          <View className="mt-1 max-h-32 overflow-hidden rounded-lg border border-border">
            <ScrollView nestedScrollEnabled>
              {(towns || [])
                ?.filter((town: any) =>
                  townSearch
                    ? town.label?.toLowerCase().includes(townSearch.toLowerCase())
                    : true,
                )
                .slice(0, 20)
                .map((town: any) => (
                  <Button
                    key={town._id}
                    variant="ghost"
                    className={`w-full justify-start rounded-none border-b border-border px-3 ${
                      townId === town._id ? 'bg-secondary/10' : ''
                    }`}
                    textClassName={`text-xs ${
                      townId === town._id
                        ? 'font-bold text-secondary dark:text-yellow-400'
                        : ''
                    }`}
                    label={town.label}
                    onPress={() => {
                      setValue('townId', town._id);
                      setValue('townSearch', town.label);
                    }}
                  />
                ))}
            </ScrollView>
          </View>
        </View>

        <View>
          <Text className="mb-1 text-xs font-medium">
            {t('control.select-violation')}
          </Text>
          <ControlledInput
            control={control}
            name="violationSearch"
            placeholder={t('control.search-violation')}
            onChangeText={() => setValue('locationViolationId', '')}
          />
          <View className="mt-1 max-h-32 overflow-hidden rounded-lg border border-border">
            <ScrollView nestedScrollEnabled>
              {filteredViolations
                .slice(0, 20)
                .map((lv: any) => (
                  <Button
                    key={lv._id}
                    variant="ghost"
                    className={`w-full justify-start rounded-none border-b border-border px-3 ${
                      watch('locationViolationId') === lv._id
                        ? 'bg-secondary/10'
                        : ''
                    }`}
                    textClassName={`text-xs ${
                      watch('locationViolationId') === lv._id
                        ? 'font-bold text-secondary dark:text-yellow-400'
                        : ''
                    }`}
                    label={`${lv.label} - ${lv.price ?? ''} kr`}
                    onPress={() => {
                      setValue('locationViolationId', lv._id);
                      setValue('violationSearch', `${lv.label} - ${lv.price ?? ''} kr`);
                    }}
                  />
                ))}
            </ScrollView>
          </View>
        </View>

        <Button
          label={isSubmitting ? t('forms.submitting') : t('forms.submit')}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
        {isSubmitting && (
          <ActivityIndicator size="small" className="mt-2" />
        )}
      </ScrollView>
    </Modal>
  );
}
