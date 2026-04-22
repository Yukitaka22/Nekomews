import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/colors';

export default function SitterLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.sitter.primary,
        tabBarInactiveTintColor: Colors.neutral.whisker,
        tabBarStyle: {
          backgroundColor: Colors.neutral.snow,
          borderTopColor: Colors.neutral.fur,
          paddingTop: 6,
          paddingBottom: 10,
          height: 68,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'ダッシュ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: '新着依頼',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📬</Text>,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: '予約',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: '収入',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧑‍⚕️</Text>,
        }}
      />
    </Tabs>
  );
}
