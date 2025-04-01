import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../../app/store/_restaurantStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';

export type SortOption = 'distance' | 'corkage' | 'rating' | null;

export const useRestaurantListData = (category?: HomeRestaurantCategory) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [sortOption, setSortOption] = useState<SortOption>(null);
    
    const restaurantData = useRestaurantStore((state: any) => state.restaurants);
    const router = useRouter();

    // 카테고리와 정렬 옵션에 따라 레스토랑 필터링 및 정렬
    useEffect(() => {
        if (restaurants.length === 0) return;
        
        let result = [...restaurants];
        
        // 정렬 로직 적용
        if (sortOption) {
            switch (sortOption) {
                case 'distance':
                    // 거리순 정렬 로직 (임시로 이름순)
                    result.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'corkage':
                    // 콜키지 비용순 정렬
                    result.sort((a, b) => {
                        // 무료 콜키지가 최상위
                        if (a.isCorkageFree && !b.isCorkageFree) return -1;
                        if (!a.isCorkageFree && b.isCorkageFree) return 1;
                        // 두 레스토랑 모두 콜키지 있을 경우 비용 비교
                        if (!a.isCorkageFree && !b.isCorkageFree) {
                            const feeA = typeof a.corkageFee === 'number' ? a.corkageFee : 0;
                            const feeB = typeof b.corkageFee === 'number' ? b.corkageFee : 0;
                            return feeA - feeB;
                        }
                        return 0;
                    });
                    break;
                case 'rating':
                    // 평점순 정렬 (임시로 이름 역순)
                    result.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
        }
        
        setFilteredRestaurants(result);
    }, [restaurants, sortOption]);

    // 초기 데이터 로딩 및 카테고리 필터링
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // 스토어에 데이터가 없으면 샘플 데이터 사용
                const data = restaurantData.length > 0 ? restaurantData : getSampleRestaurants();
                
                // 카테고리가 있으면 해당 카테고리에 맞는 레스토랑만 필터링
                if (category) {
                    setRestaurants(data.filter((restaurant: Restaurant) => restaurant.category === category));
                } else {
                    // 카테고리가 지정되지 않았으면 모든 데이터 사용
                    setRestaurants(data);
                }

                setLoading(false);
            } catch (err) {
                console.error("레스토랑 데이터 가져오기 오류:", err);
                setError(err);
                setLoading(false);
            }
        };
        
        fetchRestaurants();
    }, [restaurantData, category]);

    // 정렬 옵션 변경 핸들러
    const setSorting = (option: SortOption) => {
        setSortOption(option);
    };

    return {
        restaurants: filteredRestaurants,
        loading,
        error,
        sortOption,
        setSorting
    };
}