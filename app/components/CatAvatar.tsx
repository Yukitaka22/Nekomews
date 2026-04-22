import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/colors';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type CatAvatarProps = {
  uri?: string | null;
  name?: string;
  size?: Size;
};

const sizeMap: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * 猫のアバターコンポーネント
 * - 画像がなければ🐈絵文字で代替
 * - サイズ5段階
 */
export function CatAvatar({ uri, name, size = 'md' }: CatAvatarProps) {
  const dim = sizeMap[size];
  const emojiSize = dim * 0.55;

  return (
    <View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          accessibilityLabel={name ? `${name}のプロフィール画像` : '猫のプロフィール画像'}
        />
      ) : (
        <Text style={{ fontSize: emojiSize }}>🐈</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.owner.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
