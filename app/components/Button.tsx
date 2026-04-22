import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Mode = 'owner' | 'sitter';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  mode?: Mode;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  mode = 'owner',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  ...rest
}: ButtonProps) {
  const primaryColor = mode === 'owner' ? Colors.owner.primary : Colors.sitter.primary;
  const primaryDark = mode === 'owner' ? Colors.owner.primaryDark : Colors.sitter.primaryDark;

  const bg: Record<Variant, string> = {
    primary: primaryColor,
    secondary: Colors.neutral.snow,
    ghost: 'transparent',
    danger: Colors.semantic.error,
  };
  const fg: Record<Variant, string> = {
    primary: Colors.neutral.snow,
    secondary: primaryColor,
    ghost: primaryColor,
    danger: Colors.neutral.snow,
  };
  const borderColor: Record<Variant, string> = {
    primary: primaryColor,
    secondary: primaryColor,
    ghost: 'transparent',
    danger: Colors.semantic.error,
  };
  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const fontSizes: Record<Size, number> = { sm: 13, md: 15, lg: 17 };

  const containerStyle: ViewStyle = {
    height: heights[size],
    paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 18,
    backgroundColor: disabled ? Colors.neutral.fur : bg[variant],
    borderColor: disabled ? Colors.neutral.fur : borderColor[variant],
    borderWidth: variant === 'secondary' ? 1.5 : 0,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textStyle: TextStyle = {
    color: disabled ? Colors.neutral.whisker : fg[variant],
    fontSize: fontSizes[size],
    fontWeight: '700',
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
