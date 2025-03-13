import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RestaurantCard } from '../../../models/restaurant';
import { RestaurantCategoryInfo } from '../../../models/restaurant_category';

interface RestaurantMiniCardProps {
  restaurant: Partial<RestaurantCard>;
  onPress?: (restaurant: RestaurantCard) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24; // 화면 너비의 절반에서 마진 제외

const RestaurantMiniCardView: React.FC<RestaurantMiniCardProps> = ({ 
  restaurant, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(restaurant as RestaurantCard)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, {backgroundColor: '#E5E5E5'}]}>
        <Image 
          source={{ uri: restaurant.imageURLs?.[0] || 'https://via.placeholder.com/150' }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {restaurant.name}
        </Text>
        <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
          {restaurant.category 
            ? RestaurantCategoryInfo.getTitle(restaurant.category) 
            : '카테고리 없음'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
});

export default RestaurantMiniCardView;
