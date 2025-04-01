import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
// Firebase 관련 import 추가
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

import { useColorScheme } from '@/hooks/useColorScheme';

// Auth 관련 import 수정
import { initializeAuth, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Zustand 스토어 import
import { useRestaurantStore } from './store/_restaurantStore';

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = initializeAuth(app);
export const db = getFirestore(app);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
    // Zustand 스토어에서 데이터 설정 함수 가져오기
    const setRestaurants = useRestaurantStore((state: any) => state.setRestaurants);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Firestore 데이터 가져오기 및 Zustand 스토어에 저장
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 레스토랑 데이터 가져오기
        const restaurantsSnapshot = await getDocs(collection(db, "approved"));
        const restaurantsData = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Zustand 스토어에 레스토랑 데이터 저장
        setRestaurants(restaurantsData);
        console.log("레스토랑 데이터가 스토어에 저장되었습니다:", restaurantsData.length);
        
      } catch (error) {
        console.error("Firestore 데이터 가져오기 오류:", error);
      }
    };

    fetchData();
  }, []);


  // Firebase 인증 상태 리스너 활성화 (필요한 경우)
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     // 인증 상태 변경 처리 로직
  //     console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
  //   });

  //   // 컴포넌트 언마운트 시 리스너 해제
  //   return () => unsubscribe();
  // }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
  
  