/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import * as ImagePicker from 'expo-image-picker';
import React, { type ReactNode, useState } from 'react';
import { type UseFieldArrayAppend } from 'react-hook-form';
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { secondary } from '@/components/ui/colors';

type Props = {
  children: ReactNode;
  append: UseFieldArrayAppend<any, any>;
  callBack?: () => any;
};

export function ImageCapture({ append, children, callBack }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useSafeMutation(api.storage.generateUploadUrl);

  const handlePress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'You need to grant camera permissions to take a picture.',
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploading(true);

        // 1. Get a short-lived upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // 2. POST the file to the URL
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
          body: await fetch(asset.uri).then((res) => res.blob()),
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const { storageId } = await response.json();

        append(storageId);
        callBack?.();

        showMessage({
          type: 'success',
          message: 'Image uploaded successfully.',
        });
      }
    } catch (error) {
      console.error('Error during image capture/upload:', error);
      showMessage({
        type: 'danger',
        message:
          error instanceof Error ? error.message : 'Could not upload image.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={isUploading}>
      {isUploading ? (
        <View className="aspect-[4/5] h-32 items-center justify-center rounded-xl bg-background-secondary dark:bg-background-secondary-dark">
          <ActivityIndicator size={50} color={secondary} />
        </View>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
