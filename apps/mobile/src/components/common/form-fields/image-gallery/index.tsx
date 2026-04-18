/* eslint-disable max-lines-per-function */
import { MaterialIcons } from '@expo/vector-icons';
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery } from '@/hooks/use-convex-hooks';
import React, { useState } from 'react';
import { type Control, useFieldArray, useWatch } from 'react-hook-form';
import { Image, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib';
import { useBatchUpload } from '@/utils/batch-upload';

import { MultiImageCamera } from '../multi-image-camera';

type PhotoAsset = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
};

type Props = {
  control: Control<any>;
  name: string;
  className?: string;
  label: string;
};

export function ImageGalleryItem({ control, name, label, className }: Props) {
  const { append, remove } = useFieldArray({
    name,
    control,
  });

  const value = useWatch({
    control,
    name,
  });

  const [showMultiCamera, setShowMultiCamera] = useState(false);
  const { uploadPhotos } = useBatchUpload();

  const handleMultiCapture = async (photos: PhotoAsset[]) => {
    try {
      const storageIds = await uploadPhotos(photos);
      storageIds.forEach((id) => append(id));

      setTimeout(() => {
        console.log('Form value after append:', value);
      }, 1000);
    } catch (error) {
      console.error('Failed to upload photos:', error);
    }
  };

  return (
    <View className={cn('', className)}>
      <Text className="my-1 mt-2 !text-xxs">{label}</Text>
      <View style={{ gap: 5 }} className={cn('flex-wrap flex-row w-full')}>
        {/* Display existing images */}
        {value &&
          value.length > 0 &&
          value.map((storageId: any, index: number) => (
            <View
              key={index}
              className="relative h-32 min-w-[30%] items-center justify-center overflow-hidden rounded-xl border border-secondary/10 bg-background-secondary p-2 dark:bg-background-secondary-dark"
            >
              <TouchableOpacity
                onPress={() => remove(index)}
                className="absolute left-2 top-2 z-20 rounded-full bg-danger-500/10 p-2"
              >
                <MaterialIcons name="delete" size={16} color="red" />
              </TouchableOpacity>
              <ConvexImage className="absolute inset-0" storageId={storageId} />
            </View>
          ))}

        {(!value || value.length < 9) && (
          <>
            <View className="h-32 min-w-[30%] items-center justify-center overflow-hidden rounded-xl border border-secondary/10 bg-background-secondary p-2 dark:bg-background-secondary-dark">
              <TouchableOpacity
                onPress={() => setShowMultiCamera(true)}
                className="size-full items-center justify-center"
              >
                <MaterialIcons name="photo-camera" size={30} color="gray" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <MultiImageCamera
        visible={showMultiCamera}
        onClose={() => setShowMultiCamera(false)}
        onCaptureComplete={handleMultiCapture}
        maxPhotos={9 - (value?.length || 0)}
      />
    </View>
  );
}

export function ConvexImage({
  storageId,
  className,
}: {
  storageId: Id<'_storage'>;
  className?: string;
}) {
  const url = useSafeQuery(api.files.getUrl, { storageId });

  if (!url) {
    return <View className={cn('bg-gray-200', className)} />;
  }

  return <Image className={className} source={{ uri: url ?? undefined }} />;
}
