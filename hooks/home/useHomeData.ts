import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../../app/store/_restaurantStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';
import { RestaurantCard } from '../../api/models/restaurant';

const getRandomRestaurants = (restaurants: Restaurant[], count: number) => {
    const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const useHomeData = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [randomRestaurants, setRandomRestaurants] = useState<Restaurant[]>([]);
    const [corkageFreeRestaurants, setCorkageFreeRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    
    const restaurantData = useRestaurantStore((state: any) => state.restaurants);
    const setSelectedRestaurant = useRestaurantStore((state: any) => state.setSelectedRestaurant);
    const router = useRouter();
    
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // 샘플 데이터 사용 (스토어에 데이터가 없을 경우)
                const data = restaurantData.length > 0 ? restaurantData : getSampleRestaurants();
                
                // 레스토랑 데이터 설정
                setRestaurants(data);

                // 랜덤 레스토랑 설정
                setRandomRestaurants(getRandomRestaurants(data, 3));

                // 코키지 프리 레스토랑 필터링 후 랜덤 선택
                const corkageFree = data.filter((restaurant: Restaurant) => restaurant.isCorkageFree);
                setCorkageFreeRestaurants(restaurants);

                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
        
        fetchRestaurants();
    }, [restaurantData]);

    const handleCategoryClick = (category: HomeRestaurantCategory) => {
        router.push({
            pathname: "/home/restaurants",
            params: { category: RestaurantCategoryInfo.getTitle(category) }
        });
    }

    const handleRestaurantClick = (restaurant: RestaurantCard) => {
        // 선택된 레스토랑을 전역 상태에 저장
        setSelectedRestaurant(restaurant);
        
        // 레스토랑 상세 화면으로 이동
        router.push({
            pathname: "/home/restaurant-detail",
            params: {
                restaurantName: restaurant.name,
                backButtonTitle: "목록"
            }
        });
    }
    return {
        restaurants,
        randomRestaurants,
        corkageFreeRestaurants,
        loading,
        error,
        handleCategoryClick,
        handleRestaurantClick
    };
}