import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { TitleText } from '../../components/title_text';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../../_layout';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 인증 세션 완료 처리
// WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // 파이어베이스 콘솔에서 받은 웹 클라이언트 ID
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Google Cloud Console에서 받은 iOS 클라이언트 ID
  });

const MyPageScreen = () => {
    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 로딩 상태 관리
    const [loading, setLoading] = useState(true);
    // 사용자 정보 상태 관리
    const [userInfo, setUserInfo] = useState({
        name: '홍길동',
        email: 'user@example.com',
        profileImage: 'https://via.placeholder.com/100',
    });

    // 컴포넌트 마운트 시 인증 상태 확인
    useEffect(() => {
        console.log('인증 상태 확인 중...');
        
        // AsyncStorage에서 로그인 상태 확인
        const checkLoginStatus = async () => {
            try {
                const isUserLoggedIn = await AsyncStorage.getItem('user_logged_in');
                const userJson = await AsyncStorage.getItem('user');
                
                if (isUserLoggedIn === 'true' && userJson) {
                    console.log('AsyncStorage에서 로그인 상태 확인됨');
                    const userData = JSON.parse(userJson);
                    setIsLoggedIn(true);
                    setUserInfo({
                        name: userData.displayName || '사용자',
                        email: userData.email || '',
                        profileImage: userData.photoURL || 'https://via.placeholder.com/100',
                    });
                } else {
                    console.log('AsyncStorage에 로그인 정보 없음');
                }
                
                setLoading(false);
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                setLoading(false);
            }
        };
        
        // 로그인 상태 확인 실행
        checkLoginStatus();
        
        // Firebase 인증 상태 리스너
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // 사용자가 로그인한 경우
                setIsLoggedIn(true);
                updateUserInfo(user);
                console.log('사용자 로그인 상태 확인됨:', user.email);
                console.log('사용자 UID:', user.uid);
            } else {
                // 사용자가 로그아웃한 경우
                // AsyncStorage 확인 후 상태 업데이트 (이미 위에서 처리됨)
                console.log('Firebase에서 로그인 상태 아님');
            }
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => unsubscribe();
    }, []);

    // 사용자 정보 업데이트 함수
    const updateUserInfo = (user: User) => {
        setUserInfo({
            name: user.displayName || '사용자',
            email: user.email || '',
            profileImage: user.photoURL || 'https://via.placeholder.com/100',
        });

        // 필요한 경우 사용자 정보를 AsyncStorage에 저장
        AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
        }));
    };

    // 메뉴 항목 렌더링 함수
    const renderMenuItem = (icon: string, title: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={24} color="#555" style={styles.menuIcon} />
            <Text style={styles.menuText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    // 로그인 처리 함수 수정
    const handleGoogleLogin = async () => {
        console.log('구글로그인 시도');
        console.log('클라이언트 ID 정보:');
        console.log('웹 클라이언트 ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
        console.log('iOS 클라이언트 ID:', process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
      
        try {
          // Google Play 서비스 확인 (Android에서 필요)
          await GoogleSignin.hasPlayServices();
      
          // Google 로그인 요청
          const googleUserInfo = await GoogleSignin.signIn();
          console.log('구글 로그인 성공, 사용자 정보:', googleUserInfo);
      
          // ID 토큰 가져오기
          const idToken = googleUserInfo.data?.idToken
          if (!idToken) {
            throw new Error('ID 토큰을 가져올 수 없습니다.');
          }
      
          // 파이어베이스 인증 크리덴셜 생성
          const googleCredential = GoogleAuthProvider.credential(idToken);
      
          // 파이어베이스로 로그인
          const userCredential = await signInWithCredential(auth, googleCredential);
          console.log('파이어베이스 로그인 성공:', userCredential.user);
      
          // 로그인 상태 및 사용자 정보 저장
          setIsLoggedIn(true);
          updateUserInfo(userCredential.user);
          
          // 로그인 토큰 저장
          await AsyncStorage.setItem('auth_token', idToken);
          await AsyncStorage.setItem('user_logged_in', 'true');
          
          console.log('로그인 정보가 AsyncStorage에 저장되었습니다.');
      
          // 인증 상태 리스너에서 자동으로 상태 업데이트됨
          // 추가 작업이 필요한 경우 여기에 작성
        } catch (error) {
          console.error('구글 로그인 중 오류:', error);
          if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              console.log('사용자가 로그인을 취소했습니다.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
              console.log('로그인 진행 중입니다.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              console.log('Google Play 서비스를 사용할 수 없습니다.');
            } else {
              // message 속성 존재 여부 확인
              const errorMessage = 'message' in error ? error.message : '상세 정보 없음';
              console.log('알 수 없는 오류:', errorMessage);
              console.log(error.code);
            }
          } else {
            console.log('알 수 없는 오류 형식:', error);
          }
        }
      };

      // 로그아웃 처리 함수
      const handleLogout = async () => {
        try {
            // Google 로그인 해제
            await GoogleSignin.signOut();
            // Firebase 로그아웃
            await signOut(auth);
            
            // AsyncStorage에서 모든 인증 관련 데이터 삭제
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_logged_in');
            
            // 상태 업데이트
            setIsLoggedIn(false);
            setUserInfo({
                name: '홍길동',
                email: 'user@example.com',
                profileImage: 'https://via.placeholder.com/100',
            });
            
            console.log('로그아웃 성공 및 모든 세션 데이터 삭제됨');
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
        }
      };

      const handleAppleLogin = async () => {
        console.log('애플로그인 시도');
      };

      // 승인하기 버튼 처리 함수
      const handleApprove = () => {
        console.log('승인하기 버튼 클릭됨');
        // 여기에 승인 로직 구현
      };

    // 로그인 화면 렌더링
    const renderLoginScreen = () => (
        <View style={styles.loginContainer}>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <View style={{ position: 'relative', flex: 1, justifyContent: 'center' }}>
          <Image 
            source={require('../../../assets/images/mypage/login_google_logo.png')} 
            style={{ position: 'absolute', left: 40 }}
          />
          <Text style={styles.googleButtonText}>구글 로그인</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
        <View style={{ position: 'relative', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image 
                source={require('../../../assets/images/mypage/login_apple_logo.png')} 
            style={{ position: 'absolute', left: 40 }}
          />
          <Text style={styles.appleButtonText}>애플 로그인</Text>
        </View>
      </TouchableOpacity>
    </View>
            
            <Text style={styles.termsText}>
                로그인함으로써 <Text style={styles.termsLink}>이용약관</Text>과 <Text style={styles.termsLink}>개인정보 처리방침</Text>에 동의합니다.
            </Text>
        </View>
    );

    // 마이페이지 화면 렌더링
    const renderMyPageScreen = () => (
        <ScrollView style={styles.scrollView}>
            {/* 프로필 섹션 */}
            <View style={styles.profileSection}>
                <Image 
                    source={{ uri: userInfo.profileImage }} 
                    style={styles.profileImage} 
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <Text style={styles.userEmail}>{userInfo.email}</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>수정</Text>
                </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 내 활동 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>내 활동</Text>
                {renderMenuItem('heart-outline', '찜한 식당', () => {})}
                {renderMenuItem('time-outline', '최근 본 식당', () => {})}
                {renderMenuItem('star-outline', '리뷰 관리', () => {})}
                {userInfo.email === 'wangkobong@gmail.com' && 
                    renderMenuItem('checkmark-circle-outline', '승인하기', handleApprove)}
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 설정 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>설정</Text>
                {renderMenuItem('notifications-outline', '알림 설정', () => {})}
                {renderMenuItem('location-outline', '위치 설정', () => {})}
                {renderMenuItem('lock-closed-outline', '개인정보 설정', () => {})}
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 고객 지원 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>고객 지원</Text>
                {renderMenuItem('help-circle-outline', '자주 묻는 질문', () => {})}
                {renderMenuItem('chatbubble-outline', '1:1 문의', () => {})}
                {renderMenuItem('information-circle-outline', '앱 정보', () => {})}
            </View>

            {/* 로그아웃 버튼 */}
            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // 로딩 중일 때는 로딩 화면 표시
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TitleText>마이페이지</TitleText>
                </View>
                <View style={[styles.loginContainer, { justifyContent: 'center' }]}>
                    <Text>로딩 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TitleText>마이페이지</TitleText>
            </View>
            
            {/* 로그인 상태에 따라 다른 화면 표시 */}
            {isLoggedIn ? renderMyPageScreen() : renderLoginScreen()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    editButtonText: {
        fontSize: 14,
        color: '#555',
    },
    divider: {
        height: 10,
        backgroundColor: '#f0f0f0',
    },
    section: {
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    menuIcon: {
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        margin: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#e74c3c',
        fontWeight: '500',
    },
    // 로그인 화면 스타일
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    loginImage: {
        width: 200,
        height: 200,
        marginVertical: 30,
        resizeMode: 'contain',
    },
    loginTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    termsText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    termsLink: {
        color: '#3897f0',
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        marginTop: 100,
        zIndex: 3,
        width: '100%',
        paddingHorizontal: 39,
    },
    googleButton: {
        height: 48,
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },
    appleButton: {
        height: 48,
        width: '100%',
        backgroundColor: '#343434',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleButtonText: {
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold',
    },
    appleButtonText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default MyPageScreen;
