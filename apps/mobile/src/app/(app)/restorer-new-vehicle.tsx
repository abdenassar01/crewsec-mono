/* eslint-disable max-lines-per-function */
import { useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

// import { restorerVehicleSchema, useAddVehicle, type Vehicle } from '@/api';
import { Header, RootWrapper } from '@/components/common';
import { ScrollView, View } from '@/components/ui';

export default function RestorerNewVehicle() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [refresh, setRefresh] = useState<boolean>(false);

  // const { control, handleSubmit, reset } = useForm<Vehicle>({
  //   resolver: zodResolver(restorerVehicleSchema),
  //   defaultValues: {
  //     joinDate: generateJoinAndLeaveDates().joinDate,
  //     leaveDate: generateJoinAndLeaveDates().leaveDate,
  //   },
  // });

  // const { isPending, mutate } = useAddVehicle({
  //   onSuccess(data) {
  //     showMessage({ message: data.message, type: 'success' });
  //     setRefresh((prev) => !prev);
  //     reset();
  //   },
  // });

  // const onSubmit = (data: Vehicle) => {
  //   mutate({
  //     vehicle: {
  //       ...data,
  //       parking: { id: parking?.id },
  //     },
  //   });
  // };

  return (
    <RootWrapper className="container">
      <Header title={t('home.restorer')} />

      <View className="mt-2 flex-row items-center justify-between gap-1">
        {/* <ControlledInput
          label={t('forms.reference')}
          placeholder={t('forms.reference')}
          control={control}
          name="reference"
          className="w-full"
          wrapperClassName="w-[57%]"
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit, (error) =>
            console.log('error', error),
          )}
          className="mt-3 w-2/5 items-center justify-center rounded-xl bg-secondary p-2 dark:bg-primary"
        >
          {isPending ? (
            <ActivityIndicator size={32} color="white" />
          ) : (
            <Image
              className="!h-8 !w-8"
              source={
                colorScheme === 'dark'
                  ? require('assets/icons/dark/submit.png')
                  : require('assets/icons/light/submit.png')
              }
            />
          )}
        </TouchableOpacity> */}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: height - 210 }}
      >
        {/* <VehicleByParkingList refresh={refresh} id={parking?.id} /> */}
      </ScrollView>
    </RootWrapper>
  );
}
