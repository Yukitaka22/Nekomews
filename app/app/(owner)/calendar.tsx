import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Card, Badge } from '@/components';
import { Colors } from '@/constants/colors';

export default function CalendarScreen() {
  // NOTE: Full calendar implementation in Sprint 3
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>予定</Text>
        </View>

        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={{ fontSize: 22 }}>🍚</Text>
            <Badge variant="warning" small>自動</Badge>
          </View>
          <Text style={styles.alertTitle}>ごはんの残量が少なくなっています</Text>
          <Text style={styles.alertBody}>あと3日分ほどです。購入を検討しましょう。</Text>
        </Card>

        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={{ fontSize: 22 }}>💊</Text>
            <Badge variant="info" small>自動</Badge>
          </View>
          <Text style={styles.alertTitle}>フィラリア予防薬の投薬日</Text>
          <Text style={styles.alertBody}>毎月26日のリマインドです</Text>
        </Card>

        <EmptyState
          emoji="📅"
          title="カレンダー機能は Sprint 3 で公開"
          message="自動スケジュール（ごはん・猫砂・ワクチン）と手動予定を月表示で管理できるようになります"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.owner.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.neutral.ink },
  alertCard: { marginBottom: 12 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, marginBottom: 4 },
  alertBody: { fontSize: 12, color: Colors.neutral.whisker, lineHeight: 18 },
});
