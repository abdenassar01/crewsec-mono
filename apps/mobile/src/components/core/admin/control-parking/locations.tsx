import React from 'react';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useLocations } from '@/api';
import { StaticDataSelector } from '@/components/common';

interface Props {
  control: Control<any>;
  name: string;
}

export function LocationSelector({ control, name }: Props) {
  const [query, setQuery] = React.useState<string>('');
  const { data, isPending } = useLocations({
    variables: { page: 0, limit: 12, query },
  });

  const { t } = useTranslation();

  return (
    <>
      <StaticDataSelector
        control={control}
        name={name}
        items={data?.data.content || []}
        extractDisplayMember={(item) => item.label || ''}
        extractValue={(item) => item.id}
        label={t('control.locations')}
        loading={isPending}
        onTextChange={(text) => setQuery(text)}
      />
    </>
  );
}
