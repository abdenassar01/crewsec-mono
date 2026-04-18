import React, { useState } from 'react';
import { type Control } from 'react-hook-form';
import { View } from 'react-native';

// import { type StaticData, useLocationViolationsByLocation } from '@/api';
import { Input } from '@/components/ui';

interface Props {
  control: Control<any>;
  name: string;
  locationId: any;
}

export function ViolationSelector({ control, name, locationId }: Props) {
  const [query, setQuery] = useState<string>('');
  // const { data, isPending } = useLocationViolationsByLocation({
  //   variables: { page: 0, limit: 50, locationId },
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
                {item.violation.label}
              </Text>
            </TouchableOpacity>
          )),
        )}
      </View> */}
    </View>
  );
}
