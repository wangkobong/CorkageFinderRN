import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../_layout';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type {
  GetProfileResponse,
  NaverLoginResponse,
} from '@react-native-seoul/naver-login';
import NaverLogin from '@react-native-seoul/naver-login';

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// 인증 스토어 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션 메서드
  googleLogin: () => Promise<void>;
  naverLogin: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  updateUserInfo: (user: User) => void;
}

// Firebase 사용자 객체를 우리의 UserData 형식으로 변환하는 헬퍼 함수
const mapUserData = (user: User | null): UserData | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
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
              set({
                isAuthenticated: true,
                user: mapUserData(user),
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
          
          // 로그인 상태 및 사용자 정보 저장
          set({
            isAuthenticated: true,
            user: mapUserData(userCredential.user),
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

      // 네이버 로그인 메서드 
      naverLogin: async () => {
        console.log(NaverLogin)
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
            const profileResult = await NaverLogin.getProfile(loginResponse.successResponse.accessToken);
            console.log('네이버 프로필 정보:', profileResult);
            
            if (profileResult.resultcode === '00' && profileResult.response) {
              // 프로필 정보 추출
              const { id, name, email, profile_image } = profileResult.response;
              
              // 임시 사용자 정보 생성 (실제로는 Firebase Custom Token을 사용해야 함)
              const userData: UserData = {
                uid: `naver:${id}`,
                displayName: name,
                email: email,
                photoURL: profile_image
              };

              console.log('네이버 로그인 정보:', userData);
              
              // // 상태 업데이트
              // set({
              //   isAuthenticated: true,
              //   user: userData,
              //   isLoading: false
              // });
              
              // // AsyncStorage에 저장
              // await AsyncStorage.setItem('user', JSON.stringify(userData));
              // await AsyncStorage.setItem('user_logged_in', 'true');
              
              // console.log('네이버 로그인 정보가 저장되었습니다.');
              
              /* 
              참고: 실제 Firebase 인증을 위해서는 서버 연동 필요
              1. 네이버 액세스 토큰을 서버에 전송
              2. 서버에서 Firebase Custom Token 생성
              3. Custom Token으로 Firebase 인증
              
              예시:
              const serverResponse = await fetch('https://your-server.com/create-firebase-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  provider: 'naver', 
                  token: loginResponse.successResponse.accessToken 
                }),
              });
              
              const { firebaseToken } = await serverResponse.json();
              const userCredential = await signInWithCustomToken(auth, firebaseToken);
              
              set({
                isAuthenticated: true,
                user: mapUserData(userCredential.user),
                isLoading: false
              });
              */
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
        // 상태 업데이트
        set({
          user: mapUserData(user),
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
