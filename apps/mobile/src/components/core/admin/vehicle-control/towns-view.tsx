import { FlashList } from '@shopify/flash-list';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { Image, Input } from '@/components/ui';
import { secondary } from '@/components/ui/colors';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib';

interface TownsViewProps {
  selectedLocationId: Id<'locations'>;
  selectedTownId: Id<'towns'> | undefined;
  onTownSelect: React.Dispatch<React.SetStateAction<Id<'towns'> | undefined>>;
}

export function TownsView({
  selectedLocationId,
  selectedTownId,
  onTownSelect,
}: TownsViewProps) {
  const [search, setSearch] = React.useState<string>('');
  const towns = useSafeQuery(api.staticData.listTownsByLocationId, {
    locationId: selectedLocationId,
    search,
  });
  const { t } = useTranslation();

  return (
    <View className="">
      <Input
        className="bg-background-secondary dark:bg-background-secondary-dark border border-secondary/10"
        placeholder="Search towns..."
        value={search}
        onChangeText={setSearch}
      />
      {towns === undefined ? (
        <ActivityIndicator color={secondary} />
      ) : (
        <FlashList
          data={towns}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-2 pb-20"
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => onTownSelect(item._id)}
              className={cn(
                'flex-row mb-2 items-center justify-between rounded-xl p-3',
                selectedTownId === item._id
                  ? 'bg-secondary/10 dark:bg-primary/10'
                  : 'bg-background-secondary dark:bg-background-secondary-dark',
              )}
            >
              <Text className="text-foreground dark:text-foreground-dark text-sm font-semibold">
                {item.label}
              </Text>
              {selectedTownId === item._id && (
                <Image
                  className="aspect-square w-6"
                  source={require('assets/icons/checkbox.png')}
                />
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          extraData={selectedTownId}
          
          ListEmptyComponent={
            <View className="mt-10 items-center justify-center">
              <Text className="text-muted-foreground dark:text-muted-foreground-dark text-center text-sm">
                {t('control.towns-empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
