import React, { useState } from 'react';
import { type Control } from 'react-hook-form';
import { View } from 'react-native';

// import { useTowns } from '@/api';
import { Input } from '@/components/ui';

interface Props {
  control: Control<any>;
  name: string;
}

export function TownSelector({ control, name }: Props) {
  const [query, setQuery] = useState<string>('');
  // const { data, isPending } = useTowns({
  //   variables: { page: 0, limit: 50, query },
  // });

  // const {
  //   field: { value, onChange },
  // } = useController({
  //   control,
  //   name,
  //   defaultValue: data?.data.content[0] && data?.data.content[0].id,
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
              onPress={() => onChange(item.id)}
              className={cn(
                'rounded-xl p-4 px-6',
                value === item.id
                  ? 'bg-success-600'
                  : 'bg-background-secondary dark:bg-background-secondary-dark',
              )}
            >
              {value === item.id && (
                <Image
                  className="absolute right-1 top-1 size-3 rounded-full bg-background-secondary p-2 dark:bg-background-secondary-dark"
                  source={require('assets/icons/checkbox.png')}
                />
              )}
              <Text
                className={cn(
                  'font-medium',
                  value === item.id
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
