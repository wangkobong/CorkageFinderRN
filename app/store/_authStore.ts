import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { auth } from '../_layout';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider } from 'firebase/auth';
import type {
  GetProfileResponse,
  NaverLoginResponse,
} from '@react-native-seoul/naver-login';
import NaverLogin from '@react-native-seoul/naver-login';
import {
  login,
  logout,
  getProfile as getKakaoProfile,
} from "@react-native-seoul/kakao-login";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { LoginUser, Provider } from '../../api/models/user';

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  provider: Provider;
}

// 인증 스토어 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션 메서드
  googleLogin: () => Promise<void>;
  appleLogin: () => Promise<void>;
  naverLogin: () => Promise<void>;
  kakaoLogin: () => Promise<void>;
  testConnection: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  updateUserInfo: (user: User) => void;
  isNewUser: (uid: string) => Promise<boolean>;
  saveUserToFirestore: (user: UserData, provider: Provider, providerId?: string) => Promise<void>;
}

// Firebase 사용자 객체를 우리의 UserData 형식으로 변환하는 헬퍼 함수
const mapUserData = (user: User | null, provider: Provider): UserData | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber || '',
    provider: provider,
  };
};

// 인증 스토어 생성
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      // 초기화 메서드: 인증 상태 변경 감지
      initialize: async () => {
        return new Promise<void>((resolve) => {
          // 로딩 상태 설정
          set({ isLoading: true });
          
          // AsyncStorage에서 로그인 상태 확인
          const checkLoginStatus = async () => {
            try {
              const isUserLoggedIn = await AsyncStorage.getItem('user_logged_in');
              const userJson = await AsyncStorage.getItem('user');
              
              if (isUserLoggedIn === 'true' && userJson) {
                console.log('AsyncStorage에서 로그인 상태 확인됨');
                const userData = JSON.parse(userJson);
                set({
                  isAuthenticated: true,
                  user: {
                    uid: userData.uid,
                    displayName: userData.displayName,
                    email: userData.email,
                    photoURL: userData.photoURL,
                    phoneNumber: userData.phoneNumber,
                    provider: userData.provider,
                  },
                  isLoading: false,
                });
              }
            } catch (error) {
              console.error('AsyncStorage 로그인 상태 확인 중 오류:', error);
            }
          };
          
          // AsyncStorage 확인
          checkLoginStatus();
          
          // Firebase 인증 상태 리스너 설정
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              // 사용자가 로그인한 경우
              // 제공자 확인
              let provider = Provider.KAKAO;
              if (user.providerData && user.providerData.length > 0) {
                const providerId = user.providerData[0].providerId;
                if (providerId.includes('google')) {
                  provider = Provider.GOOGLE;
                } else if (providerId.includes('apple')) {
                  provider = Provider.APPLE;
                } else if (providerId.includes('naver')) {
                  provider = Provider.NAVER;
                }
              }

              set({
                isAuthenticated: true,
                user: mapUserData(user, provider),
                isLoading: false,
              });
              
              // AsyncStorage에 사용자 정보 저장
              AsyncStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
              }));
              AsyncStorage.setItem('user_logged_in', 'true');
              
              console.log('Firebase 인증 상태: 로그인됨', user.email);
            } else {
              // 사용자가 로그아웃한 경우
              set({
                isAuthenticated: false,
                user: null,
                isLoading: false,
              });
              console.log('Firebase 인증 상태: 로그아웃됨');
            }
            
            resolve();
          });
          
          // 구독 해제 함수 반환 (어디에서 사용하려면 리턴값을 저장해야 함)
          return unsubscribe;
        });
      },

      // 새로운 사용자인지 확인하는 메서드
      isNewUser: async (uid: string): Promise<boolean> => {
        try {
          const db = getFirestore();
          const userDocRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userDocRef);
          return !userDoc.exists();
        } catch (error) {
          console.error('사용자 확인 중 오류:', error);
          return false;
        }
      },

      // 사용자 정보를 Firestore에 저장하는 메서드 (LoginUser 사용)
      saveUserToFirestore: async (user: UserData, provider: Provider, providerId: string = ''): Promise<void> => {
        try {
          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);
          
          // LoginUser 형식으로 데이터 구성
          const loginUser: LoginUser = {
            userID: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            profileImage: user.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            provider: provider,
            providerId: providerId,
            favorites: [],
            phoneNumber: user.phoneNumber || '',
            nickname: user.displayName || '',
            pushNotification: false,
            marketingConsent: false,
            fcmToken: '',
          };
          
          await setDoc(userDocRef, loginUser);
          console.log('사용자 정보가 LoginUser 형식으로 Firestore에 저장되었습니다.');
        } catch (error) {
          console.error('Firestore에 사용자 저장 중 오류:', error);
        }
      },

      // 구글 로그인 메서드
      googleLogin: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('구글 로그인 시도');
          
          // Google Play 서비스 확인 (Android에서 필요)
          await GoogleSignin.hasPlayServices();
          
          // Google 로그인 요청
          const googleUserInfo = await GoogleSignin.signIn();
          console.log('구글 로그인 성공, 사용자 정보:', googleUserInfo);
          
          // ID 토큰 가져오기
          const idToken = googleUserInfo.data?.idToken;
          if (!idToken) {
            throw new Error('ID 토큰을 가져올 수 없습니다.');
          }
          
          // 파이어베이스 인증 크리덴셜 생성
          const googleCredential = GoogleAuthProvider.credential(idToken);
          
          // 파이어베이스로 로그인
          const userCredential = await signInWithCredential(auth, googleCredential);
          console.log('파이어베이스 로그인 성공:', userCredential.user);
          
          // 새 사용자 확인 및 Firestore에 저장
          const userData = mapUserData(userCredential.user, Provider.GOOGLE);
          if (userData) {
            const isFirstLogin = await get().isNewUser(userData.uid);
            if (isFirstLogin) {
              await get().saveUserToFirestore(userData, Provider.GOOGLE, userCredential.user.providerData[0]?.uid || '');
              console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
            } else {
              console.log('기존 사용자입니다. Firestore에 저장하지 않습니다.');
            }
          }
          
          // 로그인 상태 및 사용자 정보 저장
          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
          });
          
          // 로그인 토큰 저장
          await AsyncStorage.setItem('auth_token', idToken);
          await AsyncStorage.setItem('user_logged_in', 'true');
          
          console.log('로그인 정보가 AsyncStorage에 저장되었습니다.');
          
        } catch (error: any) {
          console.error('구글 로그인 중 오류:', error);
          let errorMessage = '로그인 중 오류가 발생했습니다.';
          
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            errorMessage = '사용자가 로그인을 취소했습니다.';
          } else if (error.code === statusCodes.IN_PROGRESS) {
            errorMessage = '로그인 진행 중입니다.';
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            errorMessage = 'Google Play 서비스를 사용할 수 없습니다.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },

      // 애플 로그인 메서드
      appleLogin: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('애플 로그인 시도');  

          const isAvailable = await AppleAuthentication.isAvailableAsync();
          if (!isAvailable) {
              console.log('애플 로그인을 사용할 수 없습니다.');
              return;
          }
          // 애플 로그인 요청
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          // 인증 정보 확인
          if (!credential.identityToken) {
            throw new Error('애플 로그인 인증 토큰을 받지 못했습니다.');
          }

          const provider = new OAuthProvider('apple.com');
          const oAuthCredential = provider.credential({
              idToken: credential.identityToken,
              rawNonce: '' // nonce가 필요없는 경우 빈 문자열 사용
          });

          // Firebase로 로그인
          const userCredential = await signInWithCredential(auth, oAuthCredential);
          console.log('애플 로그인 성공:', userCredential.user);
          
          // 새 사용자 확인 및 Firestore에 저장
          const userData = mapUserData(userCredential.user, Provider.APPLE);
          if (userData) {
            const isFirstLogin = await get().isNewUser(userData.uid);
            if (isFirstLogin) {
              await get().saveUserToFirestore(userData, Provider.APPLE, userCredential.user.providerData[0]?.uid || '');
              console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
            } else {
              console.log('기존 사용자입니다. Firestore에 저장하지 않습니다.');
            }
          }
          
          // 상태 업데이트
          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
          });
          
          // AsyncStorage에 저장
          
          await AsyncStorage.setItem('user_logged_in', 'true');
          await AsyncStorage.setItem('auth_token', credential.identityToken);          

          console.log('애플 로그인 정보가 저장되었습니다.');
        } catch (error: any) {
          console.error('애플 로그인 중 오류:', error);
          set({ 
            isLoading: false, 
            error: error.message || '애플 로그인 중 오류가 발생했습니다.' 
          });
        }
      },        

      // 네이버 로그인 메서드 
      naverLogin: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('네이버 로그인 시도');
          
          // 네이버 로그인 초기화
          const consumerKey = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '';
          const consumerSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || '';
          const appName = 'corkageFinder';
          const serviceUrlSchemeIOS = 'com.sungyeon.corkagefinder';
          
          // 네이버 SDK 초기화
          NaverLogin.initialize({
            consumerKey,
            consumerSecret,
            appName,
            serviceUrlSchemeIOS,
          });
          
          // 네이버 로그인 요청
          const loginResponse = await NaverLogin.login();
          
          if (loginResponse.isSuccess && loginResponse.successResponse) {
            console.log('네이버 로그인 성공');
            
            // 액세스 토큰으로 프로필 정보 요청
            const accessToken = loginResponse.successResponse.accessToken;
            const profileResult = await NaverLogin.getProfile(accessToken);
            console.log('네이버 프로필 정보:', profileResult);
            
            if (profileResult.resultcode === '00' && profileResult.response) {
              // 프로필 정보 추출
              const { id, name, email, profile_image } = profileResult.response;
              
              // Firebase Functions에서 커스텀 토큰 발급 받기
              const functions = getFunctions(undefined, 'us-central1');
              
              // customLogin 함수 호출 (naverCustomTokenLogin 대신)
              const customLoginFunc = httpsCallable(functions, 'customLogin');
              
              // 네이버 프로필 정보와 액세스 토큰 전달
              const loginData = {
                platform: 'naver',
                accessToken: accessToken,
                profile: profileResult.response  // 프로필 정보 추가
              };
              
              const result = await customLoginFunc(loginData);
              console.log('customLogin 결과:', result.data);
              
              // 결과 출력
              const { firebaseToken } = result.data as { firebaseToken: string, success: boolean, message: string };
              if (!firebaseToken) {
                throw new Error('Firebase 커스텀 토큰이 반환되지 않았습니다.');
              }
              
              // Firebase 인증에 토큰 사용
              const userCredential = await signInWithCustomToken(auth, firebaseToken);
              const user = userCredential.user;
              console.log('Firebase 로그인 성공:', user.uid);
              
              // 새 사용자 확인 및 Firestore에 저장
              const userData = mapUserData(user, Provider.NAVER);
              if (userData) {
                const isFirstLogin = await get().isNewUser(userData.uid);
                if (isFirstLogin) {
                  // 네이버 ID를 providerId로 사용 (프로필 정보에서 추출)
                  const naverProviderId = profileResult.response?.id || '';
                  await get().saveUserToFirestore(userData, Provider.NAVER, naverProviderId);
                  console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
                } else {
                  console.log('기존 사용자입니다. Firestore에 저장하지 않습니다.');
                }
              }
              
              // 로그인 상태 업데이트
              set({
                isAuthenticated: true,
                user: userData,
                isLoading: false,
              });
              
              // AsyncStorage에 저장
              await AsyncStorage.setItem('user_logged_in', 'true');
              await AsyncStorage.setItem('auth_token', firebaseToken);
              console.log('네이버 로그인 정보가 저장되었습니다.');
              
            } else {
              throw new Error('네이버 프로필 정보를 가져오는데 실패했습니다.');
            }
          } else {
            console.log('네이버 로그인 실패:', loginResponse.failureResponse?.message);
            throw new Error(loginResponse.failureResponse?.message || '네이버 로그인 실패');
          }
        } catch (error: any) {
          console.error('네이버 로그인 중 오류:', error);
          set({ 
            isLoading: false, 
            error: error.message || '네이버 로그인 중 오류가 발생했습니다.' 
          });
        }
      },

      // 카카오 로그인 메서드
      kakaoLogin: async () => { 
        try {
          set({ isLoading: true, error: null });
      
          // 1. 카카오 로그인 호출
          const kakaoResult = await login();
          if (!kakaoResult || !kakaoResult.accessToken) {
            throw new Error("카카오 로그인에 실패했습니다.");
          }
          
          const accessToken = kakaoResult.accessToken;
          
          // 프로필 정보 가져오기
          const profileResult = await getKakaoProfile();
      
          // 2. Firebase Functions 호출
          const functions = getFunctions(undefined, "us-central1");
      
          // customLogin 함수 호출
          const customLoginFunc = httpsCallable(functions, "customLogin");
      
          // 서버에 전달할 데이터 구성
          const loginData = {
            platform: "kakao",
            accessToken: accessToken,
            profile: profileResult  // 프로필 정보 추가
          };
      
          const result = await customLoginFunc(loginData);
          console.log("customLogin 결과:", result.data);
      
          // 3. Firebase Authentication 로그인
          const { firebaseToken } = result.data as { firebaseToken: string, success: boolean, message: string };
          if (!firebaseToken) {
            throw new Error("Firebase 커스텀 토큰이 반환되지 않았습니다.");
          }
      
          // Firebase에 로그인
          const userCredential = await signInWithCustomToken(auth, firebaseToken);
          const user = userCredential.user;
          console.log("Firebase 로그인 성공:", user.uid);
      
          // 새 사용자 확인 및 Firestore에 저장
          const userData = mapUserData(user, Provider.KAKAO);
          if (userData) {
            const isFirstLogin = await get().isNewUser(userData.uid);
            if (isFirstLogin) {
              // 카카오 ID를 providerId로 사용 (프로필 정보에서 추출)
              const kakaoProviderId = profileResult.id?.toString() || '';
              await get().saveUserToFirestore(userData, Provider.KAKAO, kakaoProviderId);
              console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
            } else {
              console.log('기존 사용자입니다. Firestore에 저장하지 않습니다.');
            }
          }
          
          // 사용자 정보 저장
          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false
          });
          
          // AsyncStorage에 사용자 정보 저장
          await AsyncStorage.setItem('user_logged_in', 'true');
          await AsyncStorage.setItem('auth_token', firebaseToken);
          console.log('카카오 로그인 정보가 저장되었습니다.');
        } catch (error) {
          console.error("카카오 로그인 중 오류:", error);
          if (error instanceof Error) {
            console.error("오류 메시지:", error.message);
            console.error("오류 스택:", error.stack);
          }
          if (error && typeof error === "object" && "code" in error) {
            console.error("Firebase 오류 코드:", error.code);
            console.error(
              "Firebase 오류 상세:",
              "details" in error ? error.details : "상세 정보 없음"
            );
          }
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "카카오 로그인 중 오류가 발생했습니다.",
          });
        }
      },
      // 로그아웃 메서드
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Google 로그인 해제
          await GoogleSignin.signOut();
          // Firebase 로그아웃
          await signOut(auth);
          
          // AsyncStorage에서 모든 인증 관련 데이터 삭제
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_logged_in');
          
          // 상태 업데이트
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          
          console.log('로그아웃 성공 및 모든 세션 데이터 삭제됨');
        } catch (error: any) {
          console.error('로그아웃 중 오류:', error);
          set({ 
            isLoading: false, 
            error: error.message || '로그아웃 중 오류가 발생했습니다.' 
          });
        }
      },

      // 사용자 정보 업데이트 메서드
      updateUserInfo: (user: User) => {
        // 제공자 확인
        let provider = Provider.KAKAO;
        if (user.providerData && user.providerData.length > 0) {
          const providerId = user.providerData[0].providerId;
          if (providerId.includes('google')) {
            provider = Provider.GOOGLE;
          } else if (providerId.includes('apple')) {
            provider = Provider.APPLE;
          } else if (providerId.includes('naver')) {
            provider = Provider.NAVER;
          }
        }

        // 상태 업데이트
        set({
          user: mapUserData(user, provider),
        });

        // AsyncStorage에 사용자 정보 저장
        AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }));
      },

      // 오류 초기화 메서드
      clearError: () => set({ error: null }),

      // 테스트 연결 메서드
      testConnection: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('테스트 연결 시작');
          
          // Firebase Functions에서 테스트 함수 호출
          const functions = getFunctions(undefined, 'us-central1');
          console.log('Firebase Functions 모듈 로드됨');
          const connectTestFunc = httpsCallable(functions, 'connectTest');
          console.log('connectTest 함수 생성됨');

          const testData = {
            test: true,
            timestamp: new Date().toISOString(),
            device: 'React Native App'
          };
          
          console.log('테스트 데이터:', testData);
          const result = await connectTestFunc(testData);
          
          console.log('테스트 연결 결과:', result.data);
          
          // 로딩 상태 업데이트
          set({
            isLoading: false
          });
          
          // void 타입으로 맞추기 위해 명시적인 반환 없음
        } catch (error) {
          console.error('테스트 연결 중 오류:', error);
          // 오류 상세 정보 출력
          if (error instanceof Error) {
            console.error('오류 메시지:', error.message);
            console.error('오류 스택:', error.stack);
          }
          
          // Firebase 오류인 경우 더 자세한 정보 출력
          if (error && typeof error === 'object' && 'code' in error) {
            console.error('Firebase 오류 코드:', error.code);
          }
          
          if (error && typeof error === 'object' && 'details' in error) {
            console.error('Firebase 오류 상세:', error.details);
          }
          
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '테스트 연결 중 오류가 발생했습니다.'
          });
        }
      },
    }),
    {
      name: 'auth-storage', // 스토리지 키 이름
      storage: createJSONStorage(() => AsyncStorage), // AsyncStorage 사용
      partialize: (state) => ({
        // 민감한 정보 또는 함수들은 저장하지 않습니다
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);