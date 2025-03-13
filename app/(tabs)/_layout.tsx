import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "홈", 
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',    
            borderTopWidth: 0
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="around" 
        options={{ 
          title: "내 주변", 
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',    
            borderTopWidth: 0
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="register" 
        options={{ 
          title: "등록", 
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',    
            borderTopWidth: 0
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="mypage" 
        options={{ 
          title: "마이페이지", 
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',    
            borderTopWidth: 0
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
} 