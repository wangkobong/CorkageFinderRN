import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useMypageData } from '../../../hooks/mypage/useMypageData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RestaurantCard } from '@/api/models/restaurant';
import { RestaurantCategoryInfo, HomeRestaurantCategory } from '@/api/models/restaurant_category';
import { DrinkCategory } from '@/api/models/drink_category';
import RestaurantCardView from '@/app/screens/home/component/restaurant_card';

const FavoriteListScreen = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantCard[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantCard[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // 즐겨찾기 레스토랑 데이터 가져오기 (임시 데이터, 실제로는 useMypageData에서 가져올 것)
    useEffect(() => {
        // 여기서 실제 데이터를 가져오는 로직이 들어갈 것입니다
        // 임시 데이터로 대체
        const tempData: RestaurantCard[] = [
            {
                restaurantID: '1',
                name: '와인바 오월',
                category: HomeRestaurantCategory.WESTERN,
                address: '서울특별시 강남구 역삼동 123-45',
                phoneNumber: '02-1234-5678',
                corkageFee: '30,000원',
                isCorkageFree: false,
                imageURLs: ['https://via.placeholder.com/100'],
                sido: '서울',
                sigungu: '강남구',
                addressDetail: '역삼동 123-45',
                businessHours: '12:00 - 22:00',
                closedDays: '월요일',
                corkageNote: '와인 한 병당 30,000원',
                isBreaktime: false,
                breaktime: '',
                drinkCategories: [],
                comments: [],
                registerUserID: 'user1'
            },
            {
                restaurantID: '2',
                name: '스시 오마카세',
                category: HomeRestaurantCategory.JAPANESE,
                address: '서울특별시 서초구 서초동 234-56',
                phoneNumber: '02-2345-6789',
                corkageFee: '50,000원',
                isCorkageFree: false,
                imageURLs: ['https://via.placeholder.com/100'],
                sido: '서울',
                sigungu: '서초구',
                addressDetail: '서초동 234-56',
                businessHours: '17:00 - 23:00',
                closedDays: '일요일',
                corkageNote: '일본 사케만 반입 가능, 병당 50,000원',
                isBreaktime: false,
                breaktime: '',
                drinkCategories: [],
                comments: [],
                registerUserID: 'user2'
            },
            {
                restaurantID: '3',
                name: '콜키지 프리 레스토랑',
                category: HomeRestaurantCategory.WESTERN,
                address: '서울특별시 강남구 청담동 345-67',
                phoneNumber: '02-3456-7890',
                corkageFee: '0원',
                isCorkageFree: true,
                imageURLs: ['https://via.placeholder.com/100'],
                sido: '서울',
                sigungu: '강남구',
                addressDetail: '청담동 345-67',
                businessHours: '11:30 - 21:30',
                closedDays: '화요일',
                corkageNote: '콜키지 무료',
                isBreaktime: true,
                breaktime: '15:00 - 17:00',
                drinkCategories: [],
                comments: [],
                registerUserID: 'user3'
            },
        ];
        
        setFavoriteRestaurants(tempData);
        setFilteredRestaurants(tempData);
        setLoading(false);
    }, []);

    // 검색어에 따른 필터링
    useEffect(() => {
        if (searchQuery.trim() === '') {
            filterRestaurantsByCategory(selectedFilter);
        } else {
            const filtered = favoriteRestaurants.filter(
                (restaurant) => 
                    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (selectedFilter === 'all' || restaurant.category === selectedFilter)
            );
            setFilteredRestaurants(filtered);
        }
    }, [searchQuery, selectedFilter, favoriteRestaurants]);

    // 카테고리별 필터링
    const filterRestaurantsByCategory = (category: string) => {
        setSelectedFilter(category);
        if (category === 'all') {
            setFilteredRestaurants(favoriteRestaurants);
        } else {
            const filtered = favoriteRestaurants.filter(
                (restaurant) => restaurant.category === category
            );
            setFilteredRestaurants(filtered);
        }
    };

    // 레스토랑 클릭 핸들러
    const handleRestaurantPress = (restaurant: RestaurantCard) => {
        // 레스토랑 상세 페이지로 이동
        router.push({
            pathname: `/home/restaurant-detail`,
            params: { 
                restaurantName: restaurant.name,
                backButtonTitle: "즐겨찾기" 
            }
        });
    };

    const searchBarSection = () => {
        return (
            <View style={styles.searchBarSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="레스토랑 이름 검색"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    const filterSection = () => {
        const categories = [
            { id: 'all', name: '전체' },
            { id: HomeRestaurantCategory.KOREAN, name: '한식' },
            { id: HomeRestaurantCategory.JAPANESE, name: '일식' },
            { id: HomeRestaurantCategory.CHINESE, name: '중식' },
            { id: HomeRestaurantCategory.WESTERN, name: '양식' },
            { id: HomeRestaurantCategory.ASIAN, name: '아시안' },
            { id: HomeRestaurantCategory.ETC, name: '기타' },
        ];

        return (
            <View style={styles.filterSection}>
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterItem,
                                selectedFilter === item.id && styles.filterItemSelected
                            ]}
                            onPress={() => filterRestaurantsByCategory(item.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedFilter === item.id && styles.filterTextSelected
                                ]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>
        )
    }

    const renderRestaurantItem = ({ item }: { item: RestaurantCard }) => (
        <RestaurantCardView 
            restaurant={item}
            onPress={handleRestaurantPress}
        />
    );

    const favoriteListSection = () => {
        return (
            <View style={styles.favoriteListSection}>
                {loading ? (
                    <View style={styles.centerContent}>
                        <Text style={styles.loadingText}>로딩 중...</Text>
                    </View>
                ) : filteredRestaurants.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="heart-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>즐겨찾기한 레스토랑이 없습니다.</Text>
                        <Text style={styles.emptySubText}>레스토랑 상세 페이지에서 하트를 눌러 즐겨찾기에 추가해보세요.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item.restaurantID}
                        renderItem={renderRestaurantItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {searchBarSection()}
            {filterSection()}
            {favoriteListSection()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchBarSection: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterSection: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterList: {
        paddingHorizontal: 16,
    },
    filterItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    filterItemSelected: {
        backgroundColor: '#4A6FE7',
    },
    filterText: {
        fontSize: 14,
        color: '#555',
    },
    filterTextSelected: {
        color: '#fff',
    },
    favoriteListSection: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default FavoriteListScreen;

