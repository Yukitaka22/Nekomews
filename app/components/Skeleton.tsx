import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: Colors.neutral.fur }, animatedStyle, style]}
    />
  );
}

/**
 * シッターカードのスケルトン（検索ページ用）
 */
export function SitterCardSkeleton() {
  return (
    <View style={styles.sitterCard}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sitterCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.fur,
  },
});
