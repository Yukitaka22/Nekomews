import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
};

export function Card({ children, onPress, style, padding = 16, elevated = false }: CardProps) {
  const Container: any = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        elevated && styles.elevated,
        { padding },
        style,
        pressed && onPress && { opacity: 0.92, transform: [{ scale: 0.995 }] },
      ]}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.snow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.fur,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
});
