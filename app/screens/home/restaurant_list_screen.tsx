import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native'; 
import { RestaurantCard } from '@/api/models/restaurant';   
import { useRestaurantListData, SortOption } from '@/hooks/home/useRestaurantListData';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRestaurantStore } from '@/app/store/_restaurantStore';
import RestaurantCardView from '@/app/screens/home/component/restaurant_card';

interface RestaurantListScreenProps {
  category?: HomeRestaurantCategory;
  showFilterButton?: boolean;
  sortOption?: SortOption;
}

const RestaurantListScreen: React.FC<RestaurantListScreenProps> = ({ 
  category,
  showFilterButton = false,
  sortOption
}) => {
  const [selectedRestaurantCategory, setSelectedRestaurantCategory] = useState<HomeRestaurantCategory | undefined>(category);
  const [menuVisible, setMenuVisible] = useState(false);
  const { restaurants, loading, error, setSorting } = useRestaurantListData(selectedRestaurantCategory);
  const router = useRouter();
  const setSelectedRestaurant = useRestaurantStore((state: any) => state.setSelectedRestaurant);

  // sortOption prop이 변경되면 정렬 적용
  useEffect(() => {
    if (sortOption) {
      setSorting(sortOption);
    }
  }, [sortOption, setSorting]);

  // 필터 버튼을 눌렀을 때 실행될 함수
  const handleFilterPress = () => {
    setMenuVisible(true);
  };
  
  // 메뉴 아이템 선택 시 호출될 함수
  const handleMenuItemPress = (sortOption: SortOption) => {
    // 정렬 함수 호출
    setSorting(sortOption);
    // 메뉴 닫기
    setMenuVisible(false);
  };

  // 레스토랑 카테고리 선택 핸들러
  const handleRestaurantCategorySelection = (restaurantCategory: HomeRestaurantCategory | undefined) => {
    setSelectedRestaurantCategory(restaurantCategory);
    
    // 라우터를 사용하여 URL 파라미터 업데이트
    if (restaurantCategory) {
      router.setParams({ 
        category: RestaurantCategoryInfo.getTitle(restaurantCategory) 
      });
    } else {
      router.setParams({ category: undefined });
    }
  };

  // 레스토랑 아이템 클릭 시 호출될 함수
  const handleRestaurantPress = (restaurant: RestaurantCard) => {
    setSelectedRestaurant(restaurant);

    // 레스토랑 상세 페이지로 이동
    router.push({
      pathname: '/home/restaurant-detail',
      params: { 
        restaurantName: restaurant.name,
        backButtonTitle: '뒤로'
      }
    });
  };

  const restaurantFilterSection = () => (
    <View style={styles.restaurantCategorySection}>
      <View style={{ flex: 1 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantCategoryScrollContainer}
          bounces={true}
          alwaysBounceHorizontal={false}
          snapToAlignment="center"
        >
          <TouchableOpacity
            style={[
              styles.restaurantCategoryTab, 
              selectedRestaurantCategory === undefined && styles.selectedRestaurantCategoryTab
            ]}
            onPress={() => handleRestaurantCategorySelection(undefined)}
          >
            <Text style={styles.emojiText}>🔍</Text>
            <Text style={[
              styles.restaurantCategoryTabText, 
              selectedRestaurantCategory === undefined && styles.selectedRestaurantCategoryTabText
            ]}>
              전체
            </Text>
          </TouchableOpacity>
          
          {RestaurantCategoryInfo.allCases().map((cat) => {
            const isSelected = selectedRestaurantCategory === cat;
            return (
              <TouchableOpacity 
                key={cat}
                style={[
                  styles.restaurantCategoryTab, 
                  isSelected && styles.selectedRestaurantCategoryTab
                ]}
                onPress={() => handleRestaurantCategorySelection(cat)}
              >
                <Text style={styles.emojiText}>{RestaurantCategoryInfo.getEmoji(cat)}</Text>
                <Text style={[
                  styles.restaurantCategoryTabText, 
                  isSelected && styles.selectedRestaurantCategoryTabText
                ]}>
                  {RestaurantCategoryInfo.getTitle(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      {showFilterButton && (
        <TouchableOpacity 
          onPress={handleFilterPress}
          style={styles.filterButton}
        >
          <Ionicons name="options-outline" size={20} color="#444" />
          <Text style={styles.filterButtonText}>필터</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRestaurantItem = ({ item }: { item: RestaurantCard }) => (
    <RestaurantCardView 
      restaurant={item}
      onPress={handleRestaurantPress}
    />
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

  // 필터 모달 섹션을 별도의 함수로 추출
  const filterModalSection = () => (
    <Modal
      transparent={true}
      visible={menuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("distance")}
          >
            <Ionicons name="navigate-outline" size={20} color="#333" />
            <Text style={styles.menuItemText}>거리순</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("corkage")}
          >
            <Ionicons name="cash-outline" size={20} color="#333" />
            <Text style={styles.menuItemText}>콜키지비용순</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("rating")}
          >
            <Ionicons name="star-outline" size={20} color="#333" />
            <Text style={styles.menuItemText}>평점순</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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
      {restaurantFilterSection()}
      {restaurantListSection()}
      {filterModalSection()}
    </SafeAreaView>
  );
}

export default RestaurantListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    restaurantCategorySection: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    restaurantCategoryScrollContainer: {
        paddingHorizontal: 20,
    },
    restaurantCategoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#f5f5f5',
    },
    selectedRestaurantCategoryTab: {
        backgroundColor: '#4A6FE7',
    },
    restaurantCategoryTabText: {
        fontSize: 14,
        color: '#555',
    },
    selectedRestaurantCategoryTabText: {
        color: '#fff',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 20,
    },
    filterButtonText: {
        fontSize: 14,
        color: '#444',
        marginLeft: 5,
    },
    listContainer: {
        padding: 16,
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
    emojiText: {
        fontSize: 20,
        marginRight: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        backgroundColor: 'white',
        marginTop: 60,
        marginRight: 10,
        borderRadius: 8,
        padding: 5,
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    }
});