import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { TitleText } from '../../components/title_text';
import { Ionicons } from '@expo/vector-icons';

const MyPageScreen = () => {
    // 로그인 상태 (임시로 false로 설정)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 사용자 정보 (실제 앱에서는 상태 관리 또는 API에서 가져올 수 있습니다)
    const userInfo = {
        name: '홍길동',
        email: 'user@example.com',
        profileImage: 'https://via.placeholder.com/100',
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
    const handleGoogleLogin = () => {
        console.log('구글로그인 시도');
        // 실제 로그인 로직 구현 필요
        // 로그인 성공 시 아래 코드 실행
        // setIsLoggedIn(true);
    };

    const handleAppleLogin = () => {
        console.log('애플로그인 시도');
        // 실제 로그인 로직 구현 필요
        // 로그인 성공 시 아래 코드 실행
        // setIsLoggedIn(true);
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
                onPress={() => setIsLoggedIn(false)}
            >
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
        </ScrollView>
    );

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
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
