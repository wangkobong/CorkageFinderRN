import React, { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantListScreen from '../screens/home/restaurant_list_screen';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { TouchableOpacity, Modal, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '@/hooks/home/useRestaurantListData';

export default function RestaurantsPage() {
  const { category } = useLocalSearchParams();
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("distance");
  
  // URL 파라미터(문자열)를 HomeRestaurantCategory 타입으로 변환
  let typedCategory: HomeRestaurantCategory | undefined;
  
  if (category) {
    const categoryValue = category.toString();
    
    // 1. 먼저 직접 enum 값과 일치하는지 확인 ("korean", "japanese" 등)
    if (Object.values(HomeRestaurantCategory).includes(categoryValue as HomeRestaurantCategory)) {
      typedCategory = categoryValue as HomeRestaurantCategory;
    } 
    // 2. enum 값과 일치하지 않으면 카테고리 이름("한식", "일식" 등)으로 검색
    else {
      // HomeRestaurantCategory의 모든 값을 순회하며 해당하는 이름 찾기
      for (const enumValue of Object.values(HomeRestaurantCategory)) {
        if (RestaurantCategoryInfo.getTitle(enumValue) === categoryValue) {
          typedCategory = enumValue;
          break;
        }
      }
    }
  }
  
  // 필터 버튼을 눌렀을 때 실행될 함수
  const handleFilterPress = () => {
    setMenuVisible(true);
  };

  // 정렬 옵션을 선택했을 때 실행될 함수
  const handleSortOptionSelect = (option: SortOption) => {
    setSortOption(option);
    setMenuVisible(false);
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackTitle: "홈",
          headerShown: true,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleFilterPress}
              style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="options-outline" size={20} color="#444" />
              <Text style={{ marginLeft: 5, fontSize: 14, color: '#444' }}>필터</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <RestaurantListScreen 
        category={typedCategory} 
        showFilterButton={false} 
        sortOption={sortOption}
      />

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'flex-start',
            alignItems: 'flex-end'
          }}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={{
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
            elevation: 5
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}
              onPress={() => handleSortOptionSelect("distance")}
            >
              <Ionicons name="navigate-outline" size={20} color="#333" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: '#333' }}>거리순</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}
              onPress={() => handleSortOptionSelect("corkage")}
            >
              <Ionicons name="cash-outline" size={20} color="#333" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: '#333' }}>콜키지비용순</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15
              }}
              onPress={() => handleSortOptionSelect("rating")}
            >
              <Ionicons name="star-outline" size={20} color="#333" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: '#333' }}>평점순</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
} 