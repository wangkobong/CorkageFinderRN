import { create } from 'zustand';
import Restaurant, { RestaurantCard } from '../../api/models/restaurant';

/**
 * 레스토랑 스토어의 상태와 액션을 정의하는 인터페이스
 */
interface RestaurantState {
  restaurants: Restaurant[];      // 모든 레스토랑 데이터를 저장하는 배열
  favorites: string[];            // 사용자가 즐겨찾기한 레스토랑 ID 목록
  isLoading: boolean;             // 데이터 로딩 상태를 표시하는 플래그
  selectedRestaurant: RestaurantCard | null; // 선택된 레스토랑 정보
  setRestaurants: (restaurants: Restaurant[]) => void;  // 레스토랑 데이터 설정 함수
  toggleFavorite: (restaurantId: string) => void;       // 즐겨찾기 토글 함수
  setSelectedRestaurant: (restaurant: RestaurantCard) => void; // 선택된 레스토랑 설정 함수
  resetSelectedRestaurant: () => void; // 선택된 레스토랑 초기화 함수
}

/**
 * Zustand 스토어 생성
 * 레스토랑 관련 상태와 액션을 관리합니다.
 */
export const useRestaurantStore = create<RestaurantState>((set) => ({
  // 초기 상태 정의
  restaurants: [],     // 빈 레스토랑 배열로 초기화
  favorites: [],       // 빈 즐겨찾기 배열로 초기화
  isLoading: false,    // 초기 로딩 상태는 false
  selectedRestaurant: null, // 선택된 레스토랑 초기화
  
  // 레스토랑 데이터를 설정하는 액션
  // Firebase에서 가져온 데이터를 이 함수로 스토어에 저장
  setRestaurants: (restaurants) => set({ restaurants }),
  
  // 특정 레스토랑을 즐겨찾기에 추가하거나 제거하는 액션
  toggleFavorite: (restaurantId) => set((state) => {
    // 이미 즐겨찾기에 있는지 확인
    const isFavorite = state.favorites.includes(restaurantId);
    return {
      // 즐겨찾기 상태에 따라 배열 업데이트
      favorites: isFavorite
        ? state.favorites.filter(id => id !== restaurantId)  // 이미 있으면 제거
        : [...state.favorites, restaurantId]                 // 없으면 추가
    };
  }),

  // 선택된 레스토랑 설정 액션
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  
  // 선택된 레스토랑 초기화 액션
  resetSelectedRestaurant: () => set({ selectedRestaurant: null }),
}));

export default {}; // TypeScript에서 모듈로 인식하게 하기 위한 빈 객체 내보내기 