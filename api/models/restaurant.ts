import RestaurantCategoryInfo, { HomeRestaurantCategory } from './restaurant_category';
import { DrinkCategory } from './drink_category';
import { Comment } from './comment';

export interface RestaurantCard {
    restaurantID: string;
    imageURLs: string[];
    name: string;
    category: HomeRestaurantCategory;
    isCorkageFree: boolean;
    corkageFee: string;
    sido: string;
    sigungu: string;
    phoneNumber: string;
    address: string;
    addressDetail: string;
    businessHours: string;
    closedDays: string;
    corkageNote: string;
    latitude?: number;
    longitude?: number;
    isBreaktime: boolean;
    breaktime: string;
    drinkCategories: DrinkCategory[];
    comments: Comment[];
    registerUserID: string;
}

export class RestaurantCardImpl implements RestaurantCard {
    constructor(
        public restaurantID: string,
        public imageURLs: string[],
        public name: string,
        public category: HomeRestaurantCategory,
        public isCorkageFree: boolean,
        public corkageFee: string,
        public sido: string,
        public sigungu: string,
        public phoneNumber: string,
        public address: string,
        public addressDetail: string,
        public businessHours: string,
        public closedDays: string,
        public corkageNote: string,
        public latitude: number | undefined = undefined,
        public longitude: number | undefined = undefined,
        public isBreaktime: boolean,
        public breaktime: string,
        public drinkCategories: DrinkCategory[],
        public comments: Comment[],
        public registerUserID: string
    ) {}

    // 필요한 경우 여기에 추가 메서드를 구현할 수 있습니다
}

// 샘플 데이터 생성 함수 (테스트용)
export const getSampleRestaurants = (): RestaurantCard[] => {
    // return [
    //     {
    //         imageURLs: ['https://example.com/image1.jpg'],
    //         name: '맛있는 레스토랑',
    //         category: HomeRestaurantCategory.KOREAN,
    //         isCorkageFree: true,
    //         corkageFee: '무료',
    //         sido: '서울특별시',
    //         sigungu: '강남구',
    //         phoneNumber: '02-1234-5678',
    //         address: '서울시 강남구 테헤란로 123',
    //         addressDetail: '2층',
    //         businessHours: '11:00-22:00',
    //         closedDays: '매주 월요일',
    //         corkageNote: '와인만 콜키지 가능',
    //         latitude: 37.5,
    //         longitude: 127.0,
    //         isBreaktime: true,
    //         breaktime: '15:00-17:00',
    //         drinkCategories: [DrinkCategory.WINE, DrinkCategory.WHISKEY]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '분위기 좋은 바',
    //         category: HomeRestaurantCategory.JAPANESE,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.WHISKEY, DrinkCategory.BEER]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '분위기 좋은 바',
    //         category: HomeRestaurantCategory.JAPANESE,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.BEER, DrinkCategory.OTHERS]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '분위기 좋은 바',
    //         category: HomeRestaurantCategory.JAPANESE,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.KOREAN_TRADITIONAL, DrinkCategory.WINE]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '분위기 좋은 바',
    //         category: HomeRestaurantCategory.JAPANESE,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.BAIJIU, DrinkCategory.KOREAN_TRADITIONAL]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '멕시칸',
    //         category: HomeRestaurantCategory.ETC,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.OTHERS, DrinkCategory.BEER]
    //     },
    //     {
    //         imageURLs: ['https://example.com/image2.jpg'],
    //         name: '쌀국수1',
    //         category: HomeRestaurantCategory.ASIAN,
    //         isCorkageFree: false,
    //         corkageFee: '병당 2만원',
    //         sido: '서울특별시',
    //         sigungu: '마포구',
    //         phoneNumber: '02-9876-5432',
    //         address: '서울시 마포구 홍대로 456',
    //         addressDetail: '',
    //         businessHours: '18:00-02:00',
    //         closedDays: '연중무휴',
    //         corkageNote: '주류 반입 시 사전 문의 필요',
    //         latitude: 37.55,
    //         longitude: 126.9,
    //         isBreaktime: false,
    //         breaktime: '',
    //         drinkCategories: [DrinkCategory.WINE, DrinkCategory.WHISKEY, DrinkCategory.BEER]
    //     }
    // ];

    return [];
}; 

export default RestaurantCardImpl;