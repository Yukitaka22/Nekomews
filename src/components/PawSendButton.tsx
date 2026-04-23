import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type PawSendButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  mode?: 'owner' | 'sitter';
};

/**
 * 肉球型送信ボタン（シンプル版）
 * Nekomewsブランドのシグネチャ要素
 * タップ時は Pressable ネイティブの scale でバウンス
 */
export function PawSendButton({ onPress, disabled = false, mode = 'owner' }: PawSendButtonProps) {
  const color = mode === 'owner' ? Colors.owner.primary : Colors.sitter.primary;
  const bg = disabled ? Colors.neutral.fur : color;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, transform: [{ scale: pressed ? 0.88 : 1 }] },
      ]}
    >
      <View style={styles.pawContainer}>
        <View style={[styles.pad, styles.topLeft]} />
        <View style={[styles.pad, styles.topRight]} />
        <View style={[styles.pad, styles.midLeft]} />
        <View style={[styles.pad, styles.midRight]} />
        <View style={styles.palm} />
      </View>
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
  pawContainer: { width: 28, height: 28, position: 'relative' },
  pad: { position: 'absolute', width: 6, height: 7, borderRadius: 3, backgroundColor: 'white' },
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
    backgroundColor: 'white',
  },
});
