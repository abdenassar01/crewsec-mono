/* eslint-disable max-lines-per-function */
import type { Id } from 'convex/_generated/dataModel';
import { t } from 'i18next';
import { useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Header, RootWrapper } from '@/components/common';
import { Image, Text } from '@/components/ui';
import { useVehicleControlSession } from '@/contexts/vehicle-control-session-context';
import { cn } from '@/lib';
import { type ReferenceEntry } from '@/services/vehicle-control-storage';

import { LocationsView } from './locations-view';
import { ReferenceDetailScreen } from './reference-detail-screen';
import { SessionTimer } from './session-timer';
import { TownDetailScreen } from './town-detail-screen';
import { TownsView } from './towns-view';
import { Dimensions } from 'react-native';

type ViewType = 'locations' | 'towns' | 'town-detail' | 'reference-detail';

export function VehicleControlOffline() {
  const { session, sessionStartTime, startSession, isSessionActive } =
    useVehicleControlSession();
  const colorScheme = useColorScheme();
  const { height } = useWindowDimensions();
  const [step, setCurrentStep] = useState<ViewType>('locations');

  const [selectedLocationId, setSelectedLocationId] = useState<
    Id<'locations'> | undefined
  >(undefined);
  const [selectedTownId, setSelectedTownId] = useState<Id<'towns'> | undefined>(
    undefined,
  );
  const [selectedReference, setSelectedReference] = useState<
    ReferenceEntry | undefined
  >(undefined);

  useEffect(() => {
    if (!isSessionActive) {
      startSession();
    }

    if (session?.currentLocationId) {
      setSelectedLocationId(session.currentLocationId);
      setCurrentStep('towns');
    }
  }, []);

  const getBackHandler = () => {
    switch (step) {
      case 'towns':
        return setCurrentStep('locations');
      case 'town-detail':
        return setCurrentStep('towns');
      case 'reference-detail':
        return setCurrentStep('town-detail');
      default:
        break;
    }
    return setCurrentStep('locations');
  };

  const getNextStep = () => {
    switch (step) {
      case 'locations':
        return setCurrentStep('towns');
      case 'towns':
        return setCurrentStep('town-detail');
      case 'town-detail':
        return setCurrentStep('reference-detail');
      default:
        break;
    }
    return setCurrentStep('locations');
  };

  const getCurrentStep = () => {
    switch (step) {
      case 'locations':
        return (
          <LocationsView
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />
        );
      case 'towns':
        return selectedLocationId ? (
          <TownsView
            selectedTownId={selectedTownId}
            onTownSelect={setSelectedTownId}
            selectedLocationId={selectedLocationId}
          />
        ) : null;
      case 'town-detail':
        return selectedTownId && selectedLocationId ? (
          <TownDetailScreen
            locationId={selectedLocationId}
            townId={selectedTownId}
            selectedReference={selectedReference}
            onReferenceSelect={setSelectedReference}
          />
        ) : null;
      case 'reference-detail':
        return selectedReference ? (
          <ReferenceDetailScreen
            referenceId={selectedReference.id}
            referenceNumber={selectedReference.reference}
            locationId={selectedReference.locationId}
            townId={selectedReference.townId}
            onBack={getBackHandler}
            startTime={sessionStartTime}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <RootWrapper className="container">
      <Header title={t('parking.vehicle-control')} className="mb-5" />
      <SessionTimer
        startTime={sessionStartTime}
        onStartSession={startSession}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="mt-3"
        style={{ height: height - 250 }}
      >
        {getCurrentStep()}
        <View className="h-4" />
      </ScrollView>
      <View
        className={cn(
          'bg-background-secondary mt-2 dark:bg-background-secondary-dark items-center p-3 rounded-xl flex-row ',
          step === 'locations' ? 'justify-end' : 'justify-between',
        )}
      >
        {step !== 'locations' && (
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={getBackHandler}
          >
            <Image
              className="aspect-square w-8"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/back.png')
                  : require('assets/icons/light/back.png')
              }
            />
            <Text className="text-sm font-semibold text-secondary dark:text-yellow-400">
              {t('forms.prev')}
            </Text>
          </TouchableOpacity>
        )}
        {step !== 'reference-detail' && (
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={getNextStep}
          >
            <Text className="text-sm font-semibold text-secondary dark:text-yellow-400">
              {t('forms.next')}
            </Text>
            <Image
              className="aspect-square w-8 rotate-180"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/back.png')
                  : require('assets/icons/light/back.png')
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </RootWrapper>
  );
}
