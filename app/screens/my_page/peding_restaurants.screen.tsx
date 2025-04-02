import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import { getDocs } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '@/app/_layout';
import { RestaurantCard } from '../../../api/models/restaurant';
import { router } from 'expo-router';

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

  const handleRestaurantPress = (restaurantId: string) => {
    console.log("handleRestaurantPress restaurantId", restaurantId);
    router.push({
      pathname: "/mypage/pending-restaurant-detail",
      params: { id: restaurantId }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>오류: {error}</Text>
      </SafeAreaView>
    ); 
  }

  return (
    <SafeAreaView style={styles.container}>
      <TitleText>대기 중인 식당 목록</TitleText>
      {pendingRestaurants.length === 0 ? (
        <Text style={styles.emptyText}>대기 중인 식당이 없습니다.</Text>
      ) : (
        <FlatList
          data={pendingRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.restaurantItem}
              onPress={() => handleRestaurantPress(item.id)}
            >
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text>{item.address}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
});

export default PendingRestaurantsScreen;
