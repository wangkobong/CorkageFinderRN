import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import { getDocs } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '@/app/_layout';
import { RestaurantCard } from '../../models/restaurant';

// 타입 확장
interface PendingRestaurant extends RestaurantCard {
  id: string;
}

const PendingRestaurantsScreen = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState<PendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 레스토랑 데이터 가져오기
        const restaurantsSnapshot = await getDocs(collection(db, "pending"));
        const restaurants = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PendingRestaurant[];
        
        setPendingRestaurants(restaurants);
        setLoading(false);
      } catch (error: any) {
        console.error("Firestore 데이터 가져오기 오류:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={pendingRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.restaurantItem}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text>{item.address}</Text>
            </View>
          )}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  restaurantItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default PendingRestaurantsScreen;
