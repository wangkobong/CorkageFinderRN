export enum Provider {
    KAKAO = "kakao",
    GOOGLE = "google",
    APPLE = "apple",
    NAVER = "naver",
}

export interface LoginUser {
  userID: string;
  name: string;
  email: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  provider: Provider;
  providerId: string;
  favorites: string[];
  phoneNumber: string;
  nickname: string;
  pushNotification: boolean;
  marketingConsent: boolean;
  fcmToken: string;
}
