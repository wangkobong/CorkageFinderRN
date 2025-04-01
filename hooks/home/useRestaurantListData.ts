import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../../app/store/_restaurantStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';

export const useRestaurantListData = (category?: HomeRestaurantCategory) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    
    const restaurantData = useRestaurantStore((state: any) => state.restaurants);

    const router = useRouter();

    console.log("useRestaurantListData 호출됨, 카테고리:", category);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // 스토어에 데이터가 없으면 샘플 데이터 사용
                const data = restaurantData.length > 0 ? restaurantData : getSampleRestaurants();
                
                console.log("가져온 레스토랑 데이터 수:", data.length);
                console.log("첫 번째 레스토랑 샘플:", data.length > 0 ? {
                    name: data[0].name,
                    category: data[0].category
                } : "데이터 없음");
                
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

    return {
        restaurants,
        loading,
        error
    };
}