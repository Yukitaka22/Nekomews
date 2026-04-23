import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/colors';

export default function OwnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.owner.primary,
        tabBarInactiveTintColor: Colors.neutral.whisker,
        tabBarStyle: {
          backgroundColor: Colors.neutral.snow,
          borderTopColor: Colors.neutral.fur,
          paddingTop: 6,
          paddingBottom: 10,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '探す',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '予定',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'ねこ日記',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📸</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'マイ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🐾</Text>,
        }}
      />
    </Tabs>
  );
}
