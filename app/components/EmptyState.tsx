import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from './Button';

type EmptyStateProps = {
  emoji?: string;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyState({ emoji = '🐾', title, message, ctaLabel, onCtaPress }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {ctaLabel && onCtaPress && (
        <View style={{ marginTop: 20 }}>
          <Button onPress={onCtaPress} variant="secondary" size="sm">
            {ctaLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.neutral.ink, marginTop: 8 },
  message: { fontSize: 14, color: Colors.neutral.whisker, textAlign: 'center', lineHeight: 20 },
});
