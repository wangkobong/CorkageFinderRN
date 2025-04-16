import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RestaurantCard } from '@/api/models/restaurant';
import { RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { Image } from 'expo-image';

interface RestaurantCardViewProps {
  restaurant: RestaurantCard;
  onPress: (restaurant: RestaurantCard) => void;
}

const RestaurantCardView: React.FC<RestaurantCardViewProps> = ({ restaurant, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.restaurantItem} 
      activeOpacity={0.7}
      onPress={() => onPress(restaurant)}
    >
      <Image 
        source={{ uri: restaurant.imageURLs?.[0] || 'https://via.placeholder.com/100' }} 
        style={styles.restaurantImage} 
        cachePolicy={'disk'}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        
        <View style={styles.infoRow}>
          <Feather name="tag" size={14} color="#555" />
          <Text style={styles.restaurantCategory}>
            {RestaurantCategoryInfo.getTitle(restaurant.category)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="dollar-sign" size={14} color="#6200ee" />
          <Text style={styles.restaurantCorkage}>
            {restaurant.isCorkageFree ? '콜키지 무료' : `콜키지 비용: ${restaurant.corkageFee}`}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="phone" size={14} color="#444" />
          <Text style={styles.restaurantPhone}>{restaurant.phoneNumber || '전화번호 정보 없음'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={14} color="#888" />
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  restaurantItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 85,
    height: 85,
    borderRadius: 8,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  restaurantCorkage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6200ee',
    marginLeft: 6,
  },
  restaurantPhone: {
    fontSize: 13,
    color: '#444',
    marginLeft: 6,
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
});

export default RestaurantCardView; 