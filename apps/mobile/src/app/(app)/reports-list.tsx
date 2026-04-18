/* eslint-disable max-lines-per-function */
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Header, RootWrapper } from '@/components/common';
import { ReportCard } from '@/components/core';
import { ActivityIndicator, colors, ScrollView } from '@/components/ui';

export default function ReportsList() {
  const { t } = useTranslation();

  // const { data, isLoading } = useMyReports({
  //   variables: { page: 0, limit: 100 },
  // });

  return (
    <RootWrapper className="container ">
      <Header title={t('report.report-list')} />
      <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
        {/* {isLoading ? (
          <ActivityIndicator size={40} color={colors.primary} />
        ) : (
          data?.data.content.map((report) => (
            <ReportCard key={`report-item-${report.id}`} report={report} />
          ))
        )} */}
      </ScrollView>
    </RootWrapper>
  );
}
