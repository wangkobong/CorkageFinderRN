import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native'; 
import { RestaurantCard } from '@/api/models/restaurant';   
import { DRINK_CATEGORIES } from '@/api/models/drink_category';
import { useRestaurantListData } from '@/hooks/home/useRestaurantListData';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { Feather } from '@expo/vector-icons';


const filterList = [
    { id: "all", name: "전체" },
    { id: "distance", name: "가까운순" },
    { id: "corkage", name: "콜키지비용" },
];

interface RestaurantListScreenProps {
  category?: HomeRestaurantCategory;
}

const RestaurantListScreen: React.FC<RestaurantListScreenProps> = ({ category }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { restaurants, loading, error } = useRestaurantListData(category);

  // 카테고리 선택/해제 핸들러
  const handleCategorySelection = (id: string, name: string) => {
    // 이미 선택된 카테고리를 다시 클릭하면 선택 해제
    if (selectedCategory === id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(id);
    }
    // 원래 핸들러 호출
    handleCategoryClick(id, name);
  };

  const handleCategoryClick = (id: string, name: string) => {
    console.log(`카테고리 클릭됨: ${id}, ${name}`);
    // 네비게이션 기능이 추가되면 다음과 같이 구현할 수 있습니다:
    // navigation.navigate('CategoryGoals', { categoryId: id, categoryName: name });
  };

  const categoryFilterSection = () => (
    <View style={styles.categorySection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContainer}
      >
        {filterList.map(({ id, name }) => {
          const isSelected = selectedCategory === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
              onPress={() => handleCategorySelection(id, name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryItemText, isSelected && styles.selectedCategoryItemText]}>
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRestaurantItem = ({ item }: { item: RestaurantCard }) => (
    <TouchableOpacity style={styles.restaurantItem} activeOpacity={0.7}>
      <Image 
        source={{ uri: item.imageURLs?.[0] || 'https://via.placeholder.com/100' }} 
        style={styles.restaurantImage} 
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        
        <View style={styles.infoRow}>
          <Feather name="tag" size={14} color="#555" />
          <Text style={styles.restaurantCategory}>{RestaurantCategoryInfo.getTitle(item.category)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="dollar-sign" size={14} color="#6200ee" />
          <Text style={styles.restaurantCorkage}>
            {item.isCorkageFree ? '콜키지 무료' : `콜키지 비용: ${item.corkageFee}`}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="phone" size={14} color="#444" />
          <Text style={styles.restaurantPhone}>{item.phoneNumber || '전화번호 정보 없음'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={14} color="#888" />
          <Text style={styles.restaurantAddress}>{item.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const restaurantListSection = () => (
    <FlatList
      data={restaurants}
      keyExtractor={(item, index) => item.name + index}
      renderItem={renderRestaurantItem}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <Text style={styles.emptyText}>해당 카테고리에 레스토랑이 없습니다.</Text>
      }
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>오류가 발생했습니다: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {categoryFilterSection()}
      {restaurantListSection()}
    </SafeAreaView>
  );
}

export default RestaurantListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    categorySection: {
        padding: 16,
    },
    categoryScrollContainer: {
        paddingTop: 25,
        paddingRight: 16
    },
    categoryList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        marginRight: 10,
    },
    selectedCategoryItem: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    categoryItemText: {
        fontSize: 14,
        color: '#000',
    },
    selectedCategoryItemText: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
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
    loadingText: {
        padding: 20,
        textAlign: 'center',
    },
    errorText: {
        padding: 20,
        textAlign: 'center',
        color: 'red',
    },
    emptyText: {
        padding: 20,
        textAlign: 'center',
        color: '#666',
    },
});