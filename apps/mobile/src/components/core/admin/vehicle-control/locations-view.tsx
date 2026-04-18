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

interface LocationsViewProps {
  selectedLocationId: Id<'locations'> | undefined;
  onLocationSelect: React.Dispatch<
    React.SetStateAction<Id<'locations'> | undefined>
  >;
}

export function LocationsView({
  selectedLocationId,
  onLocationSelect,
}: LocationsViewProps) {
  const [search, setSearch] = React.useState<string>('');
  const locations = useSafeQuery(api.staticData.listLocations, {
    search,
  });

  const { t } = useTranslation();

  return (
    <View className="">
      <Input
        className="bg-background-secondary dark:bg-background-secondary-dark border border-secondary/10"
        placeholder="Search locations..."
        value={search}
        onChangeText={setSearch}
      />
      {locations === undefined ? (
        <ActivityIndicator color={secondary} />
      ) : (
        <FlashList
          data={locations}
          contentContainerClassName="gap-2 pb-20"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => onLocationSelect(item._id)}
              className={cn(
                'flex-row mb-2 items-center justify-between rounded-xl  p-3 ',
                selectedLocationId === item._id
                  ? 'bg-secondary/10 dark:bg-primary/10'
                  : 'bg-background-secondary dark:bg-background-secondary-dark',
              )}
            >
              <Text className="text-foreground dark:text-foreground-dark text-sm font-semibold">
                {item.label}
              </Text>
              {selectedLocationId === item._id && (
                <Image
                  className="aspect-square w-6"
                  source={require('assets/icons/checkbox.png')}
                />
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          extraData={selectedLocationId}
          ListEmptyComponent={
            <View className="mt-10 items-center justify-center">
              <Text className="text-muted-foreground dark:text-muted-foreground-dark text-center text-sm">
                {t('control.locations-empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
