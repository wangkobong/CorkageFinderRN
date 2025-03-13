import React from 'react';
// import { LoginScreen } from './screens/login/login_screen';
import { Redirect } from 'expo-router';

export default function App() {
  // 앱이 시작될 때 탭 네비게이션으로 리다이렉트합니다
  return <Redirect href="/(tabs)" />;
} 