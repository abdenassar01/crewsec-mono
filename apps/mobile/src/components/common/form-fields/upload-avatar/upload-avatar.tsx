/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'react-native';
import React, { type ReactNode, useState } from 'react';
import { type Control, useController } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import {
  ActivityIndicator,
  colors,
  Image,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { cn } from '@/lib/helpers';

type Props = {
  control: Control<any>;
  name: string;
  defaultValue?: string;
  children?: ReactNode;
  className?: string;
  imgClassName?: string;
  uploadIconClassName?: string;
};

export function UploadAvatar({
  control,
  name,
  defaultValue,
  className,
  imgClassName,
  uploadIconClassName,
}: Props) {
  const {
    field: { onChange },
    fieldState: { error },
  } = useController({ control, name, defaultValue });

  const [imageUrl, setImageUrl] = useState<string>(defaultValue || '');
  const [isUploading, setIsUploading] = useState(false);

  const colorScheme = useColorScheme();

  const getUploadUrl = useSafeMutation(api.parkings.getUploadUrl);

  return (
    <>
      <TouchableOpacity
        onPress={async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            selectionLimit: 1,
            allowsEditing: false,
            quality: 0.6,
          });

          if (res.canceled) {
            showMessage({
              type: 'danger',
              message: 'You have to choose an image',
            });
            return;
          }

          try {
            setIsUploading(true);
            const asset = res.assets[0];

            const uploadUrl = await getUploadUrl();

            const response = await fetch(uploadUrl, {
              method: 'POST',
              headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
              body: await fetch(asset.uri).then((r) => r.blob()),
            });

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            const { storageId } = await response.json();

            setImageUrl(asset.uri);
            onChange(storageId as Id<'_storage'>);

            showMessage({
              type: 'success',
              message: 'Image uploaded successfully',
            });
          } catch (error) {
            console.error('Upload error:', error);
            showMessage({
              type: 'danger',
              message: 'Failed to upload image',
            });
          } finally {
            setIsUploading(false);
          }
        }}
        className={cn('relative my-2 items-center', className)}
      >
        <View>
          {isUploading ? (
            <ActivityIndicator size={50} color={colors.secondary} />
          ) : (
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : colorScheme === 'dark'
                    ? require('assets/icons/dark/avatar.png')
                    : require('assets/icons/light/avatar.png')
              }
              className={cn('w-full h-48 aspect-video rounded-xl', imgClassName)}
            />
          )}
          <Image
            source={require('assets/icons/upload.png')}
            className={cn(
              'w-6 absolute -bottom-2 -right-2 aspect-square rounded-full',
              uploadIconClassName,
            )}
          />
        </View>
      </TouchableOpacity>
      <Text className="text-[8px] text-danger-500">{error?.message}</Text>
    </>
  );
}
