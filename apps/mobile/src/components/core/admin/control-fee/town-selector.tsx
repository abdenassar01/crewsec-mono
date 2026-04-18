import { api } from 'convex/_generated/api';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ItemsGroupSelector } from '@/components/common/form-fields/items-group-selector';
import { useSafeQuery } from '@/hooks/use-convex-hooks';

interface Props {
  control: any;
  name: string;
}

export function TownDropdownSelector({ control, name }: Props) {
  const towns = useSafeQuery(api.towns.list);
  const { t } = useTranslation();

  return (
    <ItemsGroupSelector
      extractValue={(item) => item._id}
      extractDisplayValue={(item) => item.label || ''}
      control={control}
      loading={towns === undefined}
      name={name}
      items={towns ?? []}
      label={t('control.towns')}
    />
  );
}
