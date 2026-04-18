import React, { useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  Modal,
  type StyleProp,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { cn } from '@/lib';
import { SafeAreaView } from '@/components/ui';

interface ImageViewerProps {
  source: ImageSourcePropType;
  className?: string;
  thumbnailStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  modalBackgroundColor?: string;
}

export function ImageViewer({
  source,
  className,
  thumbnailStyle,
  accessibilityLabel = 'View image larger',
  modalBackgroundColor = 'bg-black/80',
}: ImageViewerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.8}
      >
        <Image
          source={source}
          className={cn('overflow-hidden', className)}
          style={thumbnailStyle}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView
          className={cn(
            'flex-1 items-center justify-center relative',
            modalBackgroundColor.startsWith('bg-') ? modalBackgroundColor : '',
          )}
          style={
            !modalBackgroundColor.startsWith('bg-')
              ? { backgroundColor: modalBackgroundColor }
              : {}
          }
        >
          <View className="max-h-[85%] w-[90%] items-center justify-center overflow-hidden">
            <Image source={source} className="size-full" resizeMode="contain" />
          </View>
          <TouchableOpacity
            className="absolute right-4 top-12 z-10 size-8 items-center justify-center rounded-full bg-black/50"
            onPress={closeModal}
            accessibilityLabel="Close image viewer"
          >
            <Text className="text-base font-bold leading-tight text-white">
              ✕
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </>
  );
}
