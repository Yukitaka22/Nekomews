import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = '接続エラーが発生しました',
  message = '時間をおいて、もう一度お試しください',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😿</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={{ marginTop: 20 }}>
          <Button onPress={onRetry} variant="secondary">
            再試行
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.neutral.ink, marginTop: 4 },
  message: { fontSize: 14, color: Colors.neutral.whisker, textAlign: 'center', lineHeight: 20, marginTop: 4 },
});
