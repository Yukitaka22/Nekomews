import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Card } from './Card';
import { Badge } from './Badge';

type CareReport = {
  meal: boolean;
  litter: boolean;
  play: boolean;
  notes?: string;
  photos?: string[];
  timestamp?: string;
};

type CareReportCardProps = {
  report: CareReport;
};

/**
 * シッターからの「お世話報告」カード
 * チャット内で特別なレイアウトで表示
 */
export function CareReportCard({ report }: CareReportCardProps) {
  return (
    <Card padding={14} style={{ borderColor: Colors.owner.primary, borderWidth: 1.5 }}>
      <View style={styles.header}>
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.title}>お世話報告</Text>
        {report.timestamp && <Text style={styles.time}>{report.timestamp}</Text>}
      </View>
      <View style={styles.checkRow}>
        <View style={styles.checkItem}>
          <Text style={styles.icon}>🍚</Text>
          <Badge variant={report.meal ? 'success' : 'default'} small>
            {report.meal ? '完了' : '未'}
          </Badge>
          <Text style={styles.itemLabel}>ごはん</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.icon}>🧺</Text>
          <Badge variant={report.litter ? 'success' : 'default'} small>
            {report.litter ? '完了' : '未'}
          </Badge>
          <Text style={styles.itemLabel}>トイレ</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.icon}>🎾</Text>
          <Badge variant={report.play ? 'success' : 'default'} small>
            {report.play ? '完了' : '未'}
          </Badge>
          <Text style={styles.itemLabel}>遊び</Text>
        </View>
      </View>
      {report.notes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{report.notes}</Text>
        </View>
      )}
      {report.photos && report.photos.length > 0 && (
        <View style={styles.photoRow}>
          {report.photos.slice(0, 3).map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.photo} />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  emoji: { fontSize: 20 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.neutral.ink, flex: 1 },
  time: { fontSize: 11, color: Colors.neutral.whisker },
  checkRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  checkItem: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 22 },
  itemLabel: { fontSize: 11, color: Colors.neutral.whisker, marginTop: 2 },
  notesBox: { marginTop: 8, padding: 10, backgroundColor: Colors.owner.bg, borderRadius: 8 },
  notesText: { fontSize: 13, color: Colors.neutral.ink, lineHeight: 18 },
  photoRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  photo: { width: 64, height: 64, borderRadius: 8 },
});
