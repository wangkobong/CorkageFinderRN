import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantListScreen from '../screens/home/restaurant_list_screen';

export default function PendingRestaurantsPage() {
  const { category } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: category?.toString() || "",
          headerBackTitle: "홈",
          headerShown: true
        }}
      />
      <RestaurantListScreen />
    </>
  );
} 