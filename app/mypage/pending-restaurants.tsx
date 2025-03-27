import React from 'react';
import { Stack } from 'expo-router';
import PendingRestaurantsScreen from '../screens/my_page/peding_restaurants.screen';

export default function PendingRestaurantsPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "대기 중인 레스토랑",
          headerBackTitle: "마이페이지",
          headerShown: true
        }}
      />
      <PendingRestaurantsScreen />
    </>
  );
} 