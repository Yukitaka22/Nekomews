import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'disputed';

type StyleConfig = { bg: string; fg: string; label: string };

const statusStyles: Record<BookingStatus, StyleConfig> = {
  requested: { bg: '#FEF3C7', fg: '#92400E', label: '承諾待ち' },
  accepted: { bg: '#DBEAFE', fg: '#1E40AF', label: '承諾済み' },
  confirmed: { bg: '#D1FAE5', fg: '#065F46', label: '予約確定' },
  completed: { bg: '#E5E7EB', fg: '#374151', label: '完了' },
  cancelled: { bg: '#FEE2E2', fg: '#991B1B', label: 'キャンセル' },
  declined: { bg: '#FEE2E2', fg: '#991B1B', label: '辞退' },
  disputed: { bg: '#FEF2F2', fg: '#7F1D1D', label: 'トラブル対応中' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = statusStyles[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});
