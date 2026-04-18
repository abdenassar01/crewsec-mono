import * as ImagePicker from 'expo-image-picker';
import React, { type ReactNode } from 'react';
import { type UseFieldArrayAppend } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { showMessage } from 'react-native-flash-message';

// import { useUploadImage } from '@/api';
import { secondary } from '@/components/ui/colors';

type Props = {
  children: ReactNode;
  append: UseFieldArrayAppend<any, string>;
  callBack?: () => any;
};

export function PictureUpload({ children, append, callBack }: Props) {
  // const { mutate, isPending } = useUploadImage();

  return (
    <TouchableOpacity
      onPress={() => {
        ImagePicker.launchImageLibraryAsync({
          selectionLimit: 1,
          allowsEditing: true,
          quality: 0.6,
        })
          .then((res) => {
            if (res.canceled) {
              showMessage({
                type: 'danger',
                message: 'You have to choose an image',
              });
            } else {
              // mutate(
              //   {
              //     image: {
              //       name: res.assets[0].fileName || 'filename',
              //       type: res.assets[0].mimeType || 'image/jpeg',
              //       uri: res.assets[0].uri,
              //     },
              //   },
              //   {
              //     onSuccess: (data) => {
              //       append(data.data);
              //       callBack?.();
              //     },
              //   },
              // );
            }
          })
          .catch((err) => console.log(err));
      }}
    >
      {/* {isPending ? <ActivityIndicator size={50} color={secondary} /> : children} */}
    </TouchableOpacity>
  );
}
