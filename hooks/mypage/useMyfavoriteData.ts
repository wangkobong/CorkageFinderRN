import { useState, useEffect } from 'react';
import { useAuthStore } from '../../app/store/_authStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';
import { RestaurantCard } from '../../api/models/restaurant';
import { doc, getDoc, collection, getDocs, query, where, getFirestore, documentId } from 'firebase/firestore';
import { DrinkCategory } from '../../api/models/drink_category';

export const useMyfavoriteData = () => {
    const router = useRouter();
    const db = getFirestore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantCard[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantCard[]>([]);

    // 검색어와 필터에 따른 레스토랑 필터링
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

    useEffect(() => {
        const fetchFavoriteRestaurants = async () => {
            const userID = useAuthStore.getState().user?.uid;
            if (!userID) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // 사용자 문서 참조 생성
                const userDocRef = doc(db, "users", userID);
                
                // 사용자 문서 가져오기
                const userDocSnapshot = await getDoc(userDocRef);
                
                if (!userDocSnapshot.exists()) {
                    setError('사용자 정보를 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }

                const userData = userDocSnapshot.data();
                const favoriteRestaurantIds = userData?.favorites || [];
                
                if (favoriteRestaurantIds.length === 0) {
                    setFavoriteRestaurants([]);
                    setFilteredRestaurants([]);
                    setLoading(false);
                    return;
                }
                
                // where in 쿼리를 사용하여 식당 데이터 가져오기
                const restaurants: RestaurantCard[] = [];
                
                // Firestore는 where in 쿼리에 최대 10개까지만 값을 허용하므로 
                // ID 목록을 10개씩 나누어 쿼리
                for (let i = 0; i < favoriteRestaurantIds.length; i += 10) {
                    const idsBatch = favoriteRestaurantIds.slice(i, i + 10);
                    
                    // where in 쿼리 생성 (문서 ID 기반)
                    const restaurantsQuery = query(
                        collection(db, "approved"),
                        where(documentId(), 'in', idsBatch)
                    );
                    
                    const querySnapshot = await getDocs(restaurantsQuery);
                    
                    querySnapshot.forEach(doc => {
                        const restaurantData = doc.data() as Omit<RestaurantCard, 'restaurantID'>;
                        
                        restaurants.push({
                            restaurantID: doc.id,
                            imageURLs: restaurantData.imageURLs || [],
                            name: restaurantData.name || '',
                            category: restaurantData.category || HomeRestaurantCategory.ETC,
                            isCorkageFree: restaurantData.isCorkageFree || false,
                            corkageFee: restaurantData.corkageFee || '',
                            sido: restaurantData.sido || '',
                            sigungu: restaurantData.sigungu || '',
                            phoneNumber: restaurantData.phoneNumber || '',
                            address: restaurantData.address || '',
                            addressDetail: restaurantData.addressDetail || '',
                            businessHours: restaurantData.businessHours || '',
                            closedDays: restaurantData.closedDays || '',
                            corkageNote: restaurantData.corkageNote || '',
                            latitude: restaurantData.latitude,
                            longitude: restaurantData.longitude,
                            isBreaktime: restaurantData.isBreaktime || false,
                            breaktime: restaurantData.breaktime || '',
                            drinkCategories: restaurantData.drinkCategories || [],
                            comments: restaurantData.comments || [],
                            registerUserID: restaurantData.registerUserID || ''
                        });
                    });
                }
                
                setFavoriteRestaurants(restaurants);
                setFilteredRestaurants(restaurants);
            } catch (error) {
                console.error('즐겨찾기 식당 정보를 가져오는 중 오류 발생:', error);
                setError('즐겨찾기 식당 정보를 가져오는 중 문제가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteRestaurants();
    }, []);

    const handleTapFavoriteRestaurant = (restaurant: RestaurantCard) => {
        router.push({
            pathname: `/home/restaurant-detail`,
            params: { 
                restaurantName: restaurant.name,
                backButtonTitle: "즐겨찾기" 
            }
        });
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const categories = [
        { id: 'all', name: '전체' },
        { id: HomeRestaurantCategory.KOREAN, name: '한식' },
        { id: HomeRestaurantCategory.JAPANESE, name: '일식' },
        { id: HomeRestaurantCategory.CHINESE, name: '중식' },
        { id: HomeRestaurantCategory.WESTERN, name: '양식' },
        { id: HomeRestaurantCategory.ASIAN, name: '아시안' },
        { id: HomeRestaurantCategory.ETC, name: '기타' },
    ];

    return {
        loading,
        error,
        favoriteRestaurants,
        filteredRestaurants,
        searchQuery,
        selectedFilter,
        categories,
        handleTapFavoriteRestaurant,
        filterRestaurantsByCategory,
        handleSearchChange,
        clearSearch
    };
};