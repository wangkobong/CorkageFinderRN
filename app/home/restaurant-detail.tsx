import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantDetailScreen from '../screens/home/restaurant_detail_screen';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RestaurantDetailPage() {

    const { restaurantName, backButtonTitle } = useLocalSearchParams();

    const handleFilterPress = () => {
        // 필터 기능 구현
        console.log('필터 버튼이 눌렸습니다');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: typeof restaurantName === 'string' ? restaurantName : Array.isArray(restaurantName) ? restaurantName[0] : '',
                    headerBackTitle: typeof backButtonTitle === 'string' ? backButtonTitle : Array.isArray(backButtonTitle) ? backButtonTitle[0] : '',
                    headerShown: true,
                    headerRight: () => (
                        <TouchableOpacity 
                            onPress={handleFilterPress}
                            style={{ marginRight: 15 }}
                        >
                            <Ionicons name="options-outline" size={24} color="#444" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <RestaurantDetailScreen />
        </>
    );
} 