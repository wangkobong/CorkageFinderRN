import { useState, useEffect } from 'react';
import { useAuthStore } from '../../app/store/_authStore';
import Restaurant, { getSampleRestaurants } from '../../api/models/restaurant';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../api/models/restaurant_category';
import { useRouter } from 'expo-router';
import { RestaurantCard } from '../../api/models/restaurant';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

// GoogleSignin 설정
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export const useMypageData = () => {
  const router = useRouter();
  
  // 인증 스토어에서 상태와 메서드 가져오기
  const { 
    isAuthenticated, 
    user, 
    isLoading: authLoading, 
    error: authError, 
    googleLogin, 
    appleLogin,
    naverLogin,
    kakaoLogin,
    logout,
    deleteAccount 
  } = useAuthStore();

  // 로컬 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isFeaturePopupVisible, setIsFeaturePopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  // 사용자 정보 상태 관리 (표시용)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    profileImage: '',
  });

  // 사용자 정보 업데이트
  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.displayName || '사용자',
        email: user.email || '',
        profileImage: user.photoURL || 'https://via.placeholder.com/100',
      });
    }
    setLoading(false);
  }, [user]);

  // 준비중 기능 팝업 표시 핸들러
  const showFeatureInProgressPopup = (featureName: string) => {
    setPopupMessage(`${featureName} 기능은 현재 준비중입니다.`);
    setIsFeaturePopupVisible(true);
  };

  // 찜한 식당 클릭 핸들러
  const handleFavoriteRestaurants = () => {
    router.push("/mypage/favorite-restaurants");
  };

  // 리뷰 관리 클릭 핸들러
  const handleReviewManagement = () => {
    showFeatureInProgressPopup('리뷰 관리');
  };

  // 승인하기 버튼 처리 함수
  const handleApprove = () => {
    router.push("/mypage/pending-restaurants");
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      setError(error);
      Alert.alert('로그인 오류', '구글 로그인 중 문제가 발생했습니다.');
    }
  };

  // 애플 로그인 핸들러
  const handleAppleLogin = async () => {
    try {
      await appleLogin();
    } catch (error) {
      setError(error);
      Alert.alert('로그인 오류', '애플 로그인 중 문제가 발생했습니다.');
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    try {
      await kakaoLogin();
    } catch (error) {
      setError(error);
      Alert.alert('로그인 오류', '카카오 로그인 중 문제가 발생했습니다.');
    }
  };
  
  // 네이버 로그인 핸들러
  const handleNaverLogin = async () => {
    try {
      await naverLogin();
    } catch (error) {
      setError(error);
      Alert.alert('로그인 오류', '네이버 로그인 중 문제가 발생했습니다.');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError(error);
      Alert.alert('로그아웃 오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  // 회원탈퇴 핸들러
  const handleDeleteAccount = async () => {
    try {
      Alert.alert(
        '회원탈퇴',
        '정말로 회원탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '탈퇴',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount();
                Alert.alert('회원탈퇴 완료', '회원탈퇴가 성공적으로 처리되었습니다.');
              } catch (error: any) {
                // 오류가 발생한 경우 처리
                if (error.message) {
                  Alert.alert('오류', error.message);
                } else {
                  Alert.alert('오류', '회원탈퇴 처리 중 문제가 발생했습니다.');
                }
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      setError(error);
      Alert.alert('오류', '회원탈퇴 처리 중 문제가 발생했습니다.');
    }
  };

  // 팝업 닫기 핸들러
  const closeFeaturePopup = () => {
    setIsFeaturePopupVisible(false);
  };

  return {
    // 상태
    isAuthenticated,
    isLoading: loading || authLoading,
    error: error || authError,
    userInfo,
    isFeaturePopupVisible,
    popupMessage,
    
    // 핸들러
    handleGoogleLogin,
    handleAppleLogin,
    handleKakaoLogin,
    handleNaverLogin,
    handleLogout,
    handleDeleteAccount,
    handleFavoriteRestaurants,
    handleReviewManagement,
    handleApprove,
    showFeatureInProgressPopup,
    closeFeaturePopup
  };
};
