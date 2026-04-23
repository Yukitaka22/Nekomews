import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const variantStyles: Record<Variant, { bg: string; fg: string }> = {
  default: { bg: Colors.neutral.fur, fg: Colors.neutral.ink },
  primary: { bg: '#FEF3C7', fg: Colors.owner.primaryDark },
  success: { bg: '#D1FAE5', fg: '#065F46' },
  warning: { bg: '#FEF3C7', fg: '#92400E' },
  error: { bg: '#FEE2E2', fg: '#991B1B' },
  info: { bg: '#DBEAFE', fg: '#1E40AF' },
};

export function Badge({
  children,
  variant = 'default',
  small,
}: {
  children: React.ReactNode;
  variant?: Variant;
  small?: boolean;
}) {
  const s = variantStyles[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: s.bg },
        small && { paddingHorizontal: 6, paddingVertical: 2 },
      ]}
    >
      <Text style={[styles.text, { color: s.fg, fontSize: small ? 10 : 12 }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '600' },
});
