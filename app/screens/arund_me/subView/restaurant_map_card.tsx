import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RestaurantCard } from '../../../models/restaurant';
import { RestaurantCategoryInfo } from '../../../models/restaurant_category';
import { HomeRestaurantCategory } from '../../../models/restaurant_category';

interface RestaurantMiniCardProps {
    restaurant: Partial<RestaurantCard>;
    onPress?: (restaurant: RestaurantCard) => void;
}

const RestaurantMapCard: React.FC<RestaurantMiniCardProps> = ({ restaurant }) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: restaurant.imageURLs?.[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>🍽️ {restaurant.name}</Text>
                <Text style={styles.type}>🏷️ {RestaurantCategoryInfo.getTitle(restaurant.category as HomeRestaurantCategory)}</Text>
                <Text style={styles.phone}>📞 {restaurant.phoneNumber}</Text>
                <Text style={styles.address}>📍 {restaurant.address}</Text>
            </View>
        </View>
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
