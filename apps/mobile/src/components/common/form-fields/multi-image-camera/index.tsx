/* eslint-disable max-lines-per-function */
import { MaterialIcons } from '@expo/vector-icons';
import { type CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { cn } from '@/lib';

type PhotoAsset = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCaptureComplete: (photos: PhotoAsset[]) => void;
  maxPhotos?: number;
};

export function MultiImageCamera({
  visible,
  onClose,
  onCaptureComplete,
  maxPhotos = 9,
}: Props) {
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoAsset[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const { height, width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);

  const takePicture = useCallback(async () => {
    // Check constraints
    if (
      !camera.current ||
      !isCameraReady ||
      capturedPhotos.length >= maxPhotos ||
      isCapturing
    ) {
      return;
    }

    try {
      setIsCapturing(true);

      const photo = await camera.current.takePictureAsync({
        shutterSound: false,
        quality: 0.8, // Slightly reduce quality for speed
        skipProcessing: true, // Android optimization
      });

      if (!photo) throw new Error('Photo was null');

      const newPhoto: PhotoAsset = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        mimeType: 'image/jpeg',
      };

      setCapturedPhotos((prev) => {
        const updated = [...prev, newPhoto];
        if (updated.length >= maxPhotos) {
          // Small delay to let the animation finish before showing review
          setTimeout(() => setIsReviewing(true), 300);
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  }, [capturedPhotos.length, maxPhotos, isCapturing, isCameraReady]);

  const deletePhoto = useCallback((index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConfirm = useCallback(() => {
    if (capturedPhotos.length > 0) {
      onCaptureComplete(capturedPhotos);
      handleClose();
    }
  }, [capturedPhotos, onCaptureComplete]);

  const handleClose = useCallback(() => {
    // Reset all states
    setCapturedPhotos([]);
    setIsReviewing(false);
    setIsCapturing(false);
    onClose();
  }, [onClose]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="white" />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View className="flex-1 items-center justify-center bg-black px-10">
          <MaterialIcons
            name="camera-alt"
            size={80}
            color="white"
            className="mb-4"
          />
          <Text className="mb-4 text-center text-xl font-semibold text-white">
            No access to camera
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="rounded-full bg-secondary px-8 py-3"
          >
            <Text className="font-semibold text-white">Grant permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black">
        <View className="flex-1 overflow-hidden rounded-lg">
          <CameraView
            ref={camera}
            style={{ width, height }}
            facing={facing}
            mode="picture"
            onCameraReady={() => setIsCameraReady(true)}
          />
        </View>
        {!isReviewing && (
          <>
            <View className="absolute inset-x-0 top-12 z-10 flex-row items-center justify-between px-5">
              <TouchableOpacity
                onPress={handleClose}
                className="size-10 items-center justify-center rounded-full bg-black/50"
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="rounded-full bg-black/50 px-4 py-2">
                <Text className="font-semibold text-white">
                  {capturedPhotos.length}/{maxPhotos}
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleCameraFacing}
                className="size-10 items-center justify-center rounded-full bg-black/50"
              >
                <MaterialIcons name="flip-camera-ios" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="absolute inset-x-0 bottom-12 z-10 flex-row items-center justify-between px-8">
              <View
                className="flex-row items-center gap-2"
                style={{ minWidth: 80 }}
              >
                {capturedPhotos.length > 0 && (
                  <TouchableOpacity onPress={() => setIsReviewing(true)}>
                    <Image
                      source={{
                        uri: capturedPhotos[capturedPhotos.length - 1].uri,
                      }}
                      className="size-12 rounded-lg border-2 border-white"
                      resizeMode="cover"
                    />
                    <View className="absolute -bottom-1 -right-1 size-5 items-center justify-center rounded-full bg-red-500">
                      <Text className="text-xs font-bold text-white">
                        {capturedPhotos.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Center: Capture Button */}
              <TouchableOpacity
                onPress={takePicture}
                disabled={
                  !isCameraReady ||
                  capturedPhotos.length >= maxPhotos ||
                  isCapturing
                }
                className={cn(
                  'w-20 h-20 rounded-full border-4 border-white items-center justify-center',
                  !isCameraReady || isCapturing ? 'opacity-50' : '',
                )}
              >
                <View className="size-16 rounded-full bg-red-500" />
              </TouchableOpacity>

              <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => setIsReviewing(true)}
                  disabled={capturedPhotos.length === 0}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    capturedPhotos.length === 0
                      ? 'bg-gray-600'
                      : 'bg-success-600',
                  )}
                >
                  <Text className="font-semibold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {isReviewing && (
          <View className="absolute inset-0 z-50 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-5 pt-12">
              <TouchableOpacity
                onPress={() => setIsReviewing(false)}
                className="p-2"
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-white">
                Review ({capturedPhotos.length}/{maxPhotos})
              </Text>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={capturedPhotos.length === 0}
              >
                <Text className="text-base font-semibold text-blue-500">
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Photos Grid */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 8,
                padding: 20,
              }}
            >
              {capturedPhotos.map((photo, index) => (
                <View key={index} className="relative aspect-square w-[30%]">
                  <Image
                    source={{ uri: photo.uri }}
                    className="size-full rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute right-1 top-1 size-8 items-center justify-center rounded-full bg-red-500/70"
                    onPress={() => deletePhoto(index)}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                  <Text className="absolute left-1 top-1 size-6 rounded-full bg-black/70 text-center text-xs font-semibold leading-6 text-white">
                    {index + 1}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Confirm Button */}
            <View className="px-5 pb-8">
              <TouchableOpacity
                onPress={handleConfirm}
                className={cn(
                  'flex-row items-center justify-center gap-2 rounded-full py-4',
                  capturedPhotos.length === 0 ? 'bg-gray-600' : 'bg-green-500',
                )}
                disabled={capturedPhotos.length === 0}
              >
                <MaterialIcons name="check" size={24} color="white" />
                <Text className="text-base font-semibold text-white">
                  Use {capturedPhotos.length} photo
                  {capturedPhotos.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
