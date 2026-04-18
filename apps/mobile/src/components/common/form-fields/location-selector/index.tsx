import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { type Control, useController } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { colors, Image, Input, Text } from '@/components/ui';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib';

interface Props {
  control: Control<any>;
  name: string;
}

export function LocationSelector({ control, name }: Props) {
  const [query, setQuery] = useState<string>('');

  // useSafeQuery extracts .data from CustomResponse, so:
  // - undefined = loading
  // - null = error
  // - Doc<'locations'>[] = success
  const locations = useSafeQuery(api.staticData.listLocations, {
    search: query,
  });

  const {
    field: { value, onChange },
  } = useController({
    control,
    name,
    defaultValue:
      locations && locations.length > 0 ? locations[0]?._id : undefined,
  });

  return (
    <View className="">
      <Input
        sheet
        value={query}
        placeholder="query"
        className="bg-background"
        onChangeText={setQuery}
      />
      {locations === undefined && (
        <ActivityIndicator color={colors.secondary} size={24} />
      )}
      {locations && (
        <ScrollView
          className="h-52 rounded-xl bg-background-secondary p-2 dark:bg-background-secondary-dark"
          contentContainerClassName="flex-row flex-wrap gap-2 pb-3"
        >
          {React.Children.toArray(
            locations.map((item: Doc<'locations'>) => (
              <TouchableOpacity
                key={`location-item-${item._id}`}
                onPress={() => onChange(item._id)}
                className={cn(
                  'rounded-xl p-3',
                  value === item._id
                    ? 'bg-success-600'
                    : 'bg-background-secondary dark:bg-background-secondary-dark',
                )}
              >
                {value === item._id && (
                  <Image
                    className="absolute right-1 top-1 size-3 rounded-full bg-white p-2 dark:bg-background-secondary-dark"
                    source={require('assets/icons/checkbox.png')}
                  />
                )}
                <Text
                  className={cn(
                    'font-medium text-xs',
                    value === item._id
                      ? 'text-white'
                      : 'text-secondary dark:text-yellow-400',
                  )}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )),
          )}
        </ScrollView>
      )}
    </View>
  );
}
