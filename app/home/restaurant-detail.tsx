import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantDetailScreen from '../screens/home/restaurant_detail_screen';

export default function RestaurantDetailPage() {

    const { restaurantName, backButtonTitle } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: typeof restaurantName === 'string' ? restaurantName : Array.isArray(restaurantName) ? restaurantName[0] : '',
          headerBackTitle: typeof backButtonTitle === 'string' ? backButtonTitle : Array.isArray(backButtonTitle) ? backButtonTitle[0] : '',
          headerShown: true
        }}
      />
      <RestaurantDetailScreen />
    </>
  );
} 