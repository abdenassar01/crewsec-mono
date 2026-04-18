import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetModal, useBottomSheet } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { cn } from '@/lib';

type ModalProps = BottomSheetModalProps & {
  title?: string;
  className?: string;
};

type ModalRef = React.ForwardedRef<BottomSheetModal>;

export const useModal = () => {
  const ref = React.useRef<BottomSheetModal>(null);
  const present = React.useCallback((data?: unknown) => {
    ref.current?.present(data);
  }, []);
  const dismiss = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);
  return { ref, present, dismiss };
};

export const Modal = React.forwardRef(
  (
    {
      snapPoints: _snapPoints = ['60%'],
      detached = false,
      ...props
    }: ModalProps,
    ref: ModalRef,
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const detachedProps = React.useMemo(
      () => getDetachedProps(detached),
      [detached],
    );
    const modal = useModal();
    const snapPoints = React.useMemo(() => _snapPoints, [_snapPoints]);

    React.useImperativeHandle(
      ref,
      () => (modal.ref.current as BottomSheetModal) || null,
    );

    const renderHandleComponent = React.useCallback(
      () => <ModalHeader isDark={isDark} />,
      [isDark],
    );

    const backgroundStyle = React.useMemo(
      () => [
        modalStyles.background,
        isDark ? modalStyles.backgroundDark : modalStyles.backgroundLight,
      ],
      [isDark],
    );

    return (
      <BottomSheetModal
        {...props}
        {...detachedProps}
        ref={modal.ref}
        index={0}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        snapPoints={snapPoints}
        backgroundComponent={({ style }) => (
          <ScrollView
            nestedScrollEnabled
            className={cn(props.className)}
            style={[style, backgroundStyle, { borderRadius: 36 }]}
            contentContainerStyle={modalStyles.contentContainer}
          />
        )}
        backdropComponent={props.backdropComponent || renderBackdrop}
        enableDynamicSizing={false}
        handleComponent={renderHandleComponent}
      />
    );
  },
);

const modalStyles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  backgroundLight: {
    backgroundColor: '#FFFFFF',
  },
  backgroundDark: {
    backgroundColor: '#0F1117',
  },
  contentContainer: {
    flexGrow: 1,
  },
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet();
  return (
    <AnimatedPressable
      onPress={() => close()}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(20)}
      style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
    />
  );
};

export const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <CustomBackdrop {...props} />
);

const getDetachedProps = (detached: boolean) => {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>;
  }
  return {} as Partial<BottomSheetModalProps>;
};

interface ModalHeaderProps {
  isDark: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = React.memo(({ isDark }) => {
  return (
    <View style={headerStyles.header}>
      <View
        style={[
          headerStyles.handle,
          isDark ? headerStyles.handleDark : headerStyles.handleLight,
        ]}
      />
    </View>
  );
});

const headerStyles = StyleSheet.create({
  header: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 80,
    height: 8,
    borderRadius: 4,
  },
  handleLight: {
    backgroundColor: '#E5E7EB',
  },
  handleDark: {
    backgroundColor: '#374151',
  },
});
