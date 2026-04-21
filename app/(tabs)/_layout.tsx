import { Tabs } from 'expo-router';
import { BarChart2, Compass, House, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'web' ? 68 : 60,
          paddingBottom: Platform.OS === 'web' ? 8 : 0,
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
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={24} color={color} strokeWidth={2} />,
        }} 
      />
      <Tabs.Screen 
        name="discover" 
        options={{ 
          title: 'Discover',
          tabBarIcon: ({ color }) => <Compass size={24} color={color} strokeWidth={2} />,
        }} 
      />
      <Tabs.Screen 
        name="stats" 
        options={{ 
          title: 'Stats',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} strokeWidth={2} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} strokeWidth={2} />,
        }} 
      />
    </Tabs>
  );
}
