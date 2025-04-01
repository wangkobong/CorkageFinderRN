import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantListScreen from '../screens/home/restaurant_list_screen';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PendingRestaurantsPage() {
  const { category } = useLocalSearchParams();
  
  console.log("URL에서 받은 카테고리:", category);
  console.log("HomeRestaurantCategory 값들:", Object.values(HomeRestaurantCategory));
  
  // URL 파라미터(문자열)를 HomeRestaurantCategory 타입으로 변환
  let typedCategory: HomeRestaurantCategory | undefined;
  
  if (category) {
    const categoryValue = category.toString();
    console.log("변환할 카테고리 값:", categoryValue);
    
    // 1. 먼저 직접 enum 값과 일치하는지 확인 ("korean", "japanese" 등)
    if (Object.values(HomeRestaurantCategory).includes(categoryValue as HomeRestaurantCategory)) {
      typedCategory = categoryValue as HomeRestaurantCategory;
      console.log("enum 값으로 직접 변환된 카테고리:", typedCategory);
    } 
    // 2. enum 값과 일치하지 않으면 카테고리 이름("한식", "일식" 등)으로 검색
    else {
      console.log("enum 값과 일치하지 않음, 카테고리 이름으로 검색");
      
      // HomeRestaurantCategory의 모든 값을 순회하며 해당하는 이름 찾기
      for (const enumValue of Object.values(HomeRestaurantCategory)) {
        if (RestaurantCategoryInfo.getTitle(enumValue) === categoryValue) {
          typedCategory = enumValue;
          console.log("이름으로 찾은 카테고리:", typedCategory);
          break;
        }
      }
      
      if (!typedCategory) {
        console.log("일치하는 카테고리를 찾지 못함:", categoryValue);
      }
    }
  }
  
  // 필터 버튼을 눌렀을 때 실행될 함수
  const handleFilterPress = () => {
    console.log('필터 버튼이 눌렸습니다');
    // 여기에 필터 관련 로직을 추가할 수 있습니다
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: category ? 
            (typedCategory ? RestaurantCategoryInfo.getTitle(typedCategory) : category.toString()) : 
            "음식점 목록",
          headerBackTitle: "홈",
          headerShown: true,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleFilterPress}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="options-outline" size={24} color="#000" />
            </TouchableOpacity>
          )
        }}
      />
      <RestaurantListScreen category={typedCategory} />
    </>
  );
} 