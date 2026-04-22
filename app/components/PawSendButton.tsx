import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

type PawSendButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  mode?: 'owner' | 'sitter';
};

/**
 * 肉球型送信ボタン
 * タップ時にスプリングアニメーション
 * Nekomewsブランドのシグネチャ要素
 */
export function PawSendButton({ onPress, disabled = false, mode = 'owner' }: PawSendButtonProps) {
  const scale = useSharedValue(1);
  const color = mode === 'owner' ? Colors.owner.primary : Colors.sitter.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    onPress();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: disabled ? Colors.neutral.fur : color },
          animatedStyle,
        ]}
      >
        {/* 肉球の形状: 4つの指球 + 1つの手のひらパッド */}
        <View style={styles.pawContainer}>
          <View style={[styles.pad, styles.topLeft, { backgroundColor: 'white' }]} />
          <View style={[styles.pad, styles.topRight, { backgroundColor: 'white' }]} />
          <View style={[styles.pad, styles.midLeft, { backgroundColor: 'white' }]} />
          <View style={[styles.pad, styles.midRight, { backgroundColor: 'white' }]} />
          <View style={[styles.palm, { backgroundColor: 'white' }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  pawContainer: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  pad: {
    position: 'absolute',
    width: 6,
    height: 7,
    borderRadius: 3,
  },
  topLeft: { top: 0, left: 4 },
  topRight: { top: 0, right: 4 },
  midLeft: { top: 8, left: 0 },
  midRight: { top: 8, right: 0 },
  palm: {
    position: 'absolute',
    width: 14,
    height: 10,
    borderRadius: 6,
    bottom: 2,
    left: 7,
  },
});
