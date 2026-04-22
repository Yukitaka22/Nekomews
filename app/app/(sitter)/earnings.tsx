import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '@/components';
import { Colors } from '@/constants/colors';

export default function SitterEarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>収入</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Card elevated>
          <Text style={styles.label}>今月の収入</Text>
          <Text style={styles.amount}>¥0</Text>
          <Text style={styles.sub}>まだ収入がありません</Text>
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>次回振込</Text>
          <Text style={styles.sub}>Stripe Connect 設定後に表示されます</Text>
          <Button onPress={() => {}} variant="secondary" mode="sitter" size="sm" style={{ marginTop: 12 }}>
            振込先を設定
          </Button>
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>月次レポート</Text>
          <Text style={styles.sub}>過去の収入履歴・税務用レポートはここに表示されます（Phase 2）</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sitter.bg },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 13, color: Colors.neutral.whisker },
  amount: { fontSize: 36, fontWeight: '700', color: Colors.neutral.ink, marginTop: 6 },
  sub: { fontSize: 12, color: Colors.neutral.whisker, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 4 },
});
