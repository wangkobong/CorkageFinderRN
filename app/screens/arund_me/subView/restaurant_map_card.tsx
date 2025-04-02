import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RestaurantCard } from '../../../../api/models/restaurant';
import { RestaurantCategoryInfo } from '../../../../api/models/restaurant_category';
import { HomeRestaurantCategory } from '../../../../api/models/restaurant_category';
import { useRouter } from 'expo-router';
import { useRestaurantStore } from '@/app/store/_index';


interface RestaurantMiniCardProps {
    restaurant: Partial<RestaurantCard>;
    onPress?: (restaurant: RestaurantCard) => void;
}

const RestaurantMapCard: React.FC<RestaurantMiniCardProps> = ({ restaurant, onPress }) => {
    const router = useRouter();
    const setSelectedRestaurant = useRestaurantStore((state: any) => state.setSelectedRestaurant);

    const handlePress = () => {
        if (onPress && restaurant as RestaurantCard) {
            onPress(restaurant as RestaurantCard);
        } else {
            setSelectedRestaurant(restaurant);

            router.push({
                pathname: '/home/restaurant-detail',
                params: { restaurantName: restaurant.name, backButtonTitle: '내 주변' }
            });
        }   
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <Image source={{ uri: restaurant.imageURLs?.[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>🍽️ {restaurant.name}</Text>
                <Text style={styles.type}>🏷️ {RestaurantCategoryInfo.getTitle(restaurant.category as HomeRestaurantCategory)}</Text>
                <Text style={styles.phone}>📞 {restaurant.phoneNumber}</Text>
                <Text style={styles.address}>📍 {restaurant.address}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default RestaurantMapCard;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        margin: 10,
    },
    image: {
        width: 100,
        height: '100%',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    infoContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        gap: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    type: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    phone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    address: {
        fontSize: 12,
        color: '#999',
    },
});
