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
import { getFirestore } from 'firebase/firestore';

import { useColorScheme } from '@/hooks/useColorScheme';

// Firebase 초기화
const app = initializeApp(firebaseConfig);
console.log('Firebase 초기화 상태:', app);
console.log("API Key:", firebaseConfig.apiKey);

// Firebase 서비스 초기화
// export const auth = getAuth(app);
export const db = getFirestore(app);
console.log("db:", db);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
  
  