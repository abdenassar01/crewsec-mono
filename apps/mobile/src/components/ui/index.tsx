import { styled } from 'nativewind';
import Svg from 'react-native-svg';

export * from './button';
export * from './checkbox';
export { default as colors } from './colors';
export * from './focus-aware-status-bar';
export * from './input';
export * from './list';
export * from './modal';
export * from './progress-bar';
export * from './select';
export * from './text';
export * from './confirmation-modal';
export * from './utils';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

//Apply styled to Svg to resolve className string into style
const StyledSvg = styled(Svg, {
  className: {
    target: 'style',
  },
});
