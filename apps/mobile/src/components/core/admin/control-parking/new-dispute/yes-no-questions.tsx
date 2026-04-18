import React from 'react';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { YesNoQuestion } from '@/components/common';
import { View } from '@/components/ui';
import { cn } from '@/lib';

interface Props {
  className?: string;
  control?: Control<any>;
}

export function YesNoQuestions({ className, control }: Props) {
  const { t } = useTranslation();

  return (
    <View
      className={cn(
        'mt-2 flex-row items-center justify-between rounded-xl border border-secondary/10 bg-background-secondary p-2 dark:bg-background-secondary-dark',
        className,
      )}
    >
      <YesNoQuestion
        question={t('control.sign-checked')}
        name="isSignsChecked"
        control={control}
      />
      <View className="h-full w-px bg-success-500" />
      <YesNoQuestion
        question={t('control.images-checked')}
        name="isPhotosTaken"
        control={control}
      />
    </View>
  );
}
