import { api } from 'convex/_generated/api';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React from 'react';
import { type Control } from 'react-hook-form';
import { View } from 'react-native';

import { StaticDataSelector } from '@/components/common';
import { useDebounce } from '@/lib';

interface Props {
  control: Control<any>;
  name: string;
}

export function ViolationSelector({ control, name }: Props) {
  const [query, setQuery] = React.useState<string>('');

  const search = useDebounce(query, 500);

  const data = useSafeQuery(api.staticData.listViolations, { search });

  return (
    <View>
      <StaticDataSelector
        control={control}
        name={name}
        items={data || []}
        extractDisplayMember={(item) => item.label}
        extractValue={(item) => item._id}
        label="Violations"
        onTextChange={(text) => setQuery(text)}
      />
    </View>
  );
}
