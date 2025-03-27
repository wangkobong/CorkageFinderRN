import React from 'react';
import { Stack } from 'expo-router';
import PendingRestaurantDetailScreen from '../screens/my_page/pending_restaurant_detail.screen';

export default function PendingRestaurantDetailPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "식당 상세 정보",
          headerBackTitle: "목록",
          headerShown: true
        }}
      />
      <PendingRestaurantDetailScreen />
    </>
  );
} 