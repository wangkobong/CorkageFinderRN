import { useState, useEffect } from 'react';
import { useAuthStore } from '../../app/store/_authStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';
import { RestaurantCard } from '../../api/models/restaurant';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

export const useMypageData = () => {
    const router = useRouter();

}