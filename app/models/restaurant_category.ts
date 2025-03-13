// 카테고리 enum 정의
export enum HomeRestaurantCategory {
  KOREAN = "korean",
  JAPANESE = "japanese",
  CHINESE = "chinese",
  WESTERN = "western",
  ASIAN = "asian",
  ETC = "etc"
}

// 카테고리 정보를 담는 클래스/객체
export class RestaurantCategoryInfo {
  // 모든 카테고리를 배열로 가져오는 정적 메서드
  static allCases(): HomeRestaurantCategory[] {
    return [
      HomeRestaurantCategory.KOREAN,
      HomeRestaurantCategory.JAPANESE,
      HomeRestaurantCategory.CHINESE, 
      HomeRestaurantCategory.WESTERN,
      HomeRestaurantCategory.ASIAN,
      HomeRestaurantCategory.ETC
    ];
  }

  // 카테고리별 제목 가져오기
  static getTitle(category: HomeRestaurantCategory): string {
    switch (category) {
      case HomeRestaurantCategory.KOREAN: return "한식";
      case HomeRestaurantCategory.JAPANESE: return "일식";
      case HomeRestaurantCategory.CHINESE: return "중식";
      case HomeRestaurantCategory.WESTERN: return "양식";
      case HomeRestaurantCategory.ASIAN: return "아시안";
      case HomeRestaurantCategory.ETC: return "기타";
    }
  }

  // 카테고리별 아이콘 이름 가져오기 (React Native Vector Icons 등에서 사용 가능)
  static getSymbol(category: HomeRestaurantCategory): string {
    switch (category) {
      case HomeRestaurantCategory.KOREAN: return "bowl-fill";
      case HomeRestaurantCategory.JAPANESE: return "fish-fill";
      case HomeRestaurantCategory.CHINESE: return "wok-fill";
      case HomeRestaurantCategory.WESTERN: return "fork-knife";
      case HomeRestaurantCategory.ASIAN: return "leaf-fill";
      case HomeRestaurantCategory.ETC: return "ellipsis-circle-fill";
    }
  }

  // 카테고리별 이모지 가져오기
  static getEmoji(category: HomeRestaurantCategory): string {
    switch (category) {
      case HomeRestaurantCategory.KOREAN: return "🥘";
      case HomeRestaurantCategory.JAPANESE: return "🍣";
      case HomeRestaurantCategory.CHINESE: return "🥟";
      case HomeRestaurantCategory.WESTERN: return "🍝";
      case HomeRestaurantCategory.ASIAN: return "🍜";
      case HomeRestaurantCategory.ETC: return "🥡";
    }
  }
} 