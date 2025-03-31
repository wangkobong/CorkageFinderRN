import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'; 
import { RestaurantCard } from '@/api/models/restaurant';   
import { DRINK_CATEGORIES } from '@/api/models/drink_category';

const filterList = [
    { id: "all", name: "전체" },
    { id: "distance", name: "가까운순" },
    { id: "corkage", name: "콜키지비용" },
];

const RestaurantListScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  return (
    <SafeAreaView style={styles.container}>
      {categoryFilterSection()}
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
});