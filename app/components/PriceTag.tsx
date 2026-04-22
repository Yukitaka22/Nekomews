import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type PriceTagProps = {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  suffix?: string;
};

export function PriceTag({ amount, size = 'md', suffix = '' }: PriceTagProps) {
  const formatted = amount.toLocaleString('ja-JP');
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  const yenSize = fontSize * 0.7;

  return (
    <View style={styles.row}>
      <Text style={[styles.yen, { fontSize: yenSize }]}>¥</Text>
      <Text style={[styles.amount, { fontSize }]}>{formatted}</Text>
      {suffix ? <Text style={[styles.suffix, { fontSize: yenSize }]}>{suffix}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  yen: { color: Colors.neutral.ink, fontWeight: '500' },
  amount: { color: Colors.neutral.ink, fontWeight: '700' },
  suffix: { color: Colors.neutral.whisker, marginLeft: 2 },
});
