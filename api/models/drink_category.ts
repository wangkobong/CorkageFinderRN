export interface DrinkCategoryData {
  id: DrinkCategory;
  title: string;
  emoji: string;
}

export enum DrinkCategory {
    ALL = "all",
    WINE = "wine",
    BEER = "beer",
    BAIJIU = "baijiu",
    WHISKEY = "whiskey",
    KOREAN_TRADITIONAL = "korean_traditional",
    SAKE = "sake",
    OTHERS = "others"
}

export const DRINK_CATEGORIES: DrinkCategoryData[] = [
  {
    id: DrinkCategory.ALL,
    title: "제한없음",
    emoji: "😊"
  },
  {
    id: DrinkCategory.WINE,
    title: "와인",
    emoji: "🍷"
  },
  {
    id: DrinkCategory.BEER,
    title: "맥주",
    emoji: "🍺"
  },
  {
    id: DrinkCategory.BAIJIU,
    title: "바이주",
    emoji: "🍶"
  },
  {
    id: DrinkCategory.WHISKEY,
    title: "위스키",
    emoji: "🥃"
  },
  {
    id: DrinkCategory.KOREAN_TRADITIONAL,
    title: "전통주",
    emoji: "🍾"
  },
  {
    id: DrinkCategory.SAKE,
    title: "사케",
    emoji: "🇯🇵"
  },
  {
    id: DrinkCategory.OTHERS,
    title: "기타",
    emoji: "🍹"
  }
];