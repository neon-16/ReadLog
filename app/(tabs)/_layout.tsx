import { Tabs } from 'expo-router';
import { House, Compass, BarChart2, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
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
