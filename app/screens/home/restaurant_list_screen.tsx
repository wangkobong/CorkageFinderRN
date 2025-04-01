import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal } from 'react-native'; 
import { RestaurantCard } from '@/api/models/restaurant';   
import { useRestaurantListData, SortOption } from '@/hooks/home/useRestaurantListData';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RestaurantListScreenProps {
  category?: HomeRestaurantCategory;
  showFilterButton?: boolean;
}

const RestaurantListScreen: React.FC<RestaurantListScreenProps> = ({ 
  category,
  showFilterButton = false
}) => {
  const [selectedRestaurantCategory, setSelectedRestaurantCategory] = useState<HomeRestaurantCategory | undefined>(category);
  const [menuVisible, setMenuVisible] = useState(false);
  const { restaurants, loading, error, setSorting } = useRestaurantListData(selectedRestaurantCategory);
  const router = useRouter();

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

  const restaurantFilterSection = () => (
    <View style={styles.restaurantCategorySection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.restaurantCategoryScrollContainer}
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
    restaurantCategorySection: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    restaurantCategoryScrollContainer: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        flex: 1,
    },
    restaurantCategoryTab: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 6,
        borderRadius: 25,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    selectedRestaurantCategoryTab: {
        backgroundColor: '#FF6347', // 토마토 레드 컬러
        borderColor: '#FF6347',
    },
    restaurantCategoryTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginLeft: 6,
    },
    selectedRestaurantCategoryTabText: {
        color: '#fff',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 15,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    filterButtonText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#444',
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