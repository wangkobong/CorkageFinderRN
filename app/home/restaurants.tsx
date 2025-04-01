import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import RestaurantListScreen from '../screens/home/restaurant_list_screen';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '@/api/models/restaurant_category';

export default function RestaurantsPage() {
  const { category } = useLocalSearchParams();
  
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
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackTitle: "홈",
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      
      <RestaurantListScreen category={typedCategory} showFilterButton={true} />
    </>
  );
} 