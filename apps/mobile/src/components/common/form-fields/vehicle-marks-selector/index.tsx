import React, { useState } from 'react';
import { type Control, useController } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

// import { useCarBrands } from '@/api';
import { colors, Image, Input } from '@/components/ui';
import { cn } from '@/lib';

interface Props {
  control: Control<any>;
  name: string;
}

export function VehicleMarkSelector({ control, name }: Props) {
  const [query, setQuery] = useState<string>('');
  // const { data, isPending } = useCarBrands({
  //   variables: { page: 0, limit: 50, query },
  // });

  // const {
  //   field: { value, onChange },
  // } = useController({
  //   control,
  //   name,
  // });

  return (
    <View className="mt-3">
      <Input value={query} placeholder="query" onChangeText={setQuery} />
      {/* {isPending && <ActivityIndicator color={colors.secondary} size={24} />}
      <View className=" flex-row flex-wrap gap-2">
        {React.Children.toArray(
          data?.data.content.map((item) => (
            <TouchableOpacity
              key={`car-brand-item-${item.id}`}
              onPress={() => onChange(item)}
              className={cn(
                'rounded-xl p-4 px-6',
                value?.id === item.id
                  ? 'bg-success-600'
                  : 'bg-background-secondary dark:bg-background-secondary-dark',
              )}
            >
              {value?.id === item.id && (
                <Image
                  className="absolute right-1 top-1 size-3 rounded-full bg-background-secondary p-2 dark:bg-background-secondary-dark"
                  source={require('assets/icons/checkbox.png')}
                />
              )}
              <Text
                className={cn(
                  'font-medium',
                  value?.id === item.id
                    ? 'text-white'
                    : 'text-secondary dark:text-yellow-400',
                )}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )),
        )}
      </View> */}
    </View>
  );
}
