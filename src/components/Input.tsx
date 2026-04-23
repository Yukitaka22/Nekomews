import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
};

export function Input({
  label,
  error,
  hint,
  required,
  rightIcon,
  onRightIconPress,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          error && styles.errored,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.neutral.whisker}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <Text style={[styles.hint, error && styles.errorText]}>{error || hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.neutral.ink, marginBottom: 6 },
  required: { color: Colors.semantic.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.fur,
    borderRadius: 12,
    backgroundColor: Colors.neutral.snow,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  focused: { borderColor: Colors.owner.primary, borderWidth: 2 },
  errored: { borderColor: Colors.semantic.error },
  input: { flex: 1, fontSize: 15, color: Colors.neutral.ink, paddingVertical: 12 },
  rightIcon: { marginLeft: 8 },
  hint: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 4, marginLeft: 2 },
  errorText: { color: Colors.semantic.error },
});
