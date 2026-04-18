/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { type Id } from 'convex/_generated/dataModel';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { TimeAgo } from '@/components/common';
import { Button, Image, Input } from '@/components/ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { cn } from '@/lib';
import { getUser } from '@/lib/storage/user-storage';
import {
  referenceDetailsStorage,
  type ReferenceEntry,
  referencesStorage,
  type TownReferences,
} from '@/services/vehicle-control-storage';

import { type TownReferenceItem } from './types-offline';

interface TownDetailScreenProps {
  townId: Id<'towns'>;
  locationId: Id<'locations'>;
  selectedReference: ReferenceEntry | undefined;
  onReferenceSelect: (reference: ReferenceEntry) => void;
}

const ReferenceItem = ({
  reference,
  onPress,
  onDelete,
  isCompleted,
  isSelected,
}: {
  reference: TownReferenceItem;
  onPress: () => void;
  onDelete: () => void;
  isCompleted: boolean;
  isSelected: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'mb-2 rounded-xl p-3',
        isSelected
          ? 'bg-secondary/10 dark:bg-primary/10'
          : isCompleted
            ? 'bg-green-500/10 dark:bg-green-900/20'
            : 'bg-background-secondary dark:bg-background-secondary-dark',
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-foreground dark:text-foreground-dark text-sm font-semibold">
            {reference.reference}
          </Text>
          {isCompleted && (
            <View className="rounded-full bg-green-500/20 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-green-600 dark:text-green-400">
                COMPLETED
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          {isSelected && (
            <Image
              className="aspect-square w-6"
              source={require('assets/icons/checkbox.png')}
            />
          )}
          <ConfirmationModal
            title="Delete Reference"
            message={`Are you sure you want to delete ${reference.reference}?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={onDelete}
          >
            <View className="rounded-full bg-red-500/10 p-2">
              <Ionicons name="trash-outline" size={15} color="#ef4444" />
            </View>
          </ConfirmationModal>
        </View>
      </View>
      {reference.createdAt && (
        <View className="mt-1 flex-row justify-between">
          <Text className="text-foreground/50 dark:text-foreground-dark/50 text-[10px]">
            {new Date(reference.createdAt).toLocaleString()}
          </Text>

          <Text className="dark:text-foreground-dark/50 rounded-full bg-purple-500/10 p-1 px-3 text-[10px] text-purple-500">
            <TimeAgo date={reference.createdAt} className="text-xxs" />
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export function TownDetailScreen({
  townId,
  locationId,
  selectedReference,
  onReferenceSelect,
}: TownDetailScreenProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const user = getUser();
  const [newReference, setNewReference] = useState('');
  const [townReferences, setTownReferences] = useState<TownReferences | null>(
    null,
  );
  const [referenceDetails, setReferenceDetails] = useState<ReferenceEntry[]>(
    [],
  );

  useEffect(() => {
    if (!user?.userId) return;

    const loadedTownRefs = referencesStorage.getTownReferences(
      townId,
      user.userId,
    );
    setTownReferences(loadedTownRefs);

    const loadedRefDetails = referenceDetailsStorage.getTownReferenceDetails(
      townId,
      user.userId,
    );
    setReferenceDetails(loadedRefDetails);
  }, [townId, user?.userId]);

  const loadReferences = () => {
    if (!user?.userId) return;

    const refs = referencesStorage.getTownReferences(townId, user.userId);
    setTownReferences(refs);

    const details = referenceDetailsStorage.getTownReferenceDetails(
      townId,
      user.userId,
    );
    setReferenceDetails(details);
  };

  const handleAddReference = () => {
    if (!newReference.trim() || !user?.userId) return;

    const currentRefs = townReferences?.references || [];
    const normalizedRef = newReference.trim().toUpperCase();

    if (currentRefs.some((r) => r.reference === normalizedRef)) {
      Alert.alert('Error', 'This reference already exists in this town.');
      return;
    }

    const newRef: TownReferenceItem = {
      reference: normalizedRef,
      createdAt: Date.now(),
      userId: user.userId,
    };

    const updatedRefs = [...currentRefs, newRef];

    referencesStorage.saveTownReferences(
      townId,
      locationId,
      updatedRefs,
      user.userId,
    );

    setNewReference('');
    loadReferences();
  };

  const handleDeleteReferenceConfirm = (refToDelete: TownReferenceItem) => {
    if (!user?.userId) return;

    const currentRefs = townReferences?.references || [];
    const updatedRefs = currentRefs.filter(
      (r) => r.reference !== refToDelete.reference,
    );

    if (updatedRefs.length === 0) {
      referencesStorage.deleteTownReferences(townId, user.userId);
      setTownReferences(null);
    } else {
      referencesStorage.saveTownReferences(
        townId,
        locationId,
        updatedRefs,
        user.userId,
      );
      loadReferences();
    }

    showMessage({
      message: 'Reference deleted successfully',
      type: 'success',
    });
  };

  const handleReferencePress = (referenceItem: TownReferenceItem) => {
    if (!user?.userId) return;

    const existingDetail = referenceDetails.find(
      (d) => d.reference === referenceItem.reference,
    );

    if (existingDetail) {
      onReferenceSelect(existingDetail);
    } else {
      const newEntry: ReferenceEntry = {
        id: `${Date.now()}-${referenceItem.reference}`,
        reference: referenceItem.reference,
        locationId,
        townId,
        galleryStorageIds: [],
        isSignsChecked: false,
        isPhotosTaken: false,
        createdAt: referenceItem.createdAt,
        userId: user.userId,
      };
      onReferenceSelect(newEntry);
    }
  };

  const isReferenceCompleted = (reference: string) => {
    const detail = referenceDetails.find((d) => d.reference === reference);
    return detail?.completedAt !== undefined;
  };

  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Input
          placeholder={t('forms.reference')}
          value={newReference}
          onChangeText={setNewReference}
          wrapperClassName="w-[89%]"
          className="bg-background-secondary dark:bg-background-secondary-dark border border-secondary/10"
          autoCapitalize="characters"
        />
        <Button
          onPress={handleAddReference}
          className="bg-secondary dark:bg-primary aspect-square w-[10%] items-center justify-center -mt-3"
        >
          <Ionicons
            name="add"
            size={12}
            color={colorScheme === 'dark' ? '#000' : '#fff'}
          />
        </Button>
      </View>

      <FlashList
        data={townReferences?.references || []}
        contentContainerClassName="pb-20 gap-2"
        renderItem={({ item }: { item: TownReferenceItem }) => (
          <ReferenceItem
            key={item.reference}
            reference={item}
            onPress={() => handleReferencePress(item)}
            onDelete={() => handleDeleteReferenceConfirm(item)}
            isCompleted={isReferenceCompleted(item.reference)}
            isSelected={selectedReference?.reference === item.reference}
          />
        )}
        keyExtractor={(item) => item.reference}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        extraData={selectedReference}
        ListEmptyComponent={
          <View className="mt-10 items-center justify-center">
            <Text className="text-muted-foreground dark:text-muted-foreground-dark text-center text-sm">
              No references added yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
