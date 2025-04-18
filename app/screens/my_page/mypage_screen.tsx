import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { TitleText } from '../../components/title_text';
import { Ionicons } from '@expo/vector-icons';
import { useMypageData } from '../../../hooks/mypage/useMypageData';

const MyPageScreen = () => {
    // useMypageData 훅 사용
    const {
        isAuthenticated,
        isLoading,
        userInfo,
        isFeaturePopupVisible,
        popupMessage,
        handleGoogleLogin,
        handleAppleLogin,
        handleKakaoLogin,
        handleNaverLogin,
        handleLogout,
        handleDeleteAccount,
        handleFavoriteRestaurants,
        handleReviewManagement,
        handleApprove,
        closeFeaturePopup
    } = useMypageData();

    // 메뉴 항목 렌더링 함수
    const renderMenuItem = (icon: string, title: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={24} color="#555" style={styles.menuIcon} />
            <Text style={styles.menuText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

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
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
      <View style={{ position: 'relative', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image 
            source={require('../../../assets/images/mypage/login_kakao_logo.png')} 
            style={{ position: 'absolute', left: 40 }}
          />
          <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.naverButton} onPress={handleNaverLogin}>
      <View style={{ position: 'relative', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image 
            source={require('../../../assets/images/mypage/login_apple_logo.png')} 
            style={{ position: 'absolute', left: 40 }}
          />
          <Text style={styles.naverButtonText}>네이버 로그인</Text>
        </View>
      </TouchableOpacity>
    </View>
            
            {/* <Text style={styles.termsText}>
                로그인함으로써 <Text style={styles.termsLink}>이용약관</Text>과 <Text style={styles.termsLink}>개인정보 처리방침</Text>에 동의합니다.
            </Text> */}
    </View>
    );

    // 마이페이지 화면 렌더링
    const renderMyPageScreen = () => (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
        >
            {/* 프로필 섹션 */}
            <View style={styles.profileSection}>
                {userInfo.profileImage ? (
                    <Image 
                        source={{ uri: userInfo.profileImage }} 
                        style={styles.profileImage} 
                    />
                ) : (
                    <View style={[styles.profileImage, styles.defaultProfileContainer]}>
                        <Text style={styles.defaultProfileText}>
                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{userInfo.name || '로그인이 필요합니다'}</Text>
                    <Text style={styles.userEmail}>{userInfo.email}</Text>
                </View>
                {/* {isAuthenticated && (
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>수정</Text>
                    </TouchableOpacity>
                )} */}
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 내 활동 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>내 활동</Text>
                {renderMenuItem('heart-outline', '찜한 식당', handleFavoriteRestaurants)}
                {/* {renderMenuItem('star-outline', '리뷰 관리', handleReviewManagement)} */}
                {userInfo.email === 'wangkobong@gmail.com' && 
                    renderMenuItem('checkmark-circle-outline', '승인하기', handleApprove)}
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 로그아웃 버튼 */}
            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
            
            {/* 회원탈퇴 버튼 */}
            <TouchableOpacity 
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
            >
                <Text style={styles.deleteAccountText}>회원탈퇴</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // 로딩 중일 때는 로딩 화면 표시
    if (isLoading) {
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
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TitleText>마이페이지</TitleText>
            </View>
            
            {/* 로그인 상태에 따라 다른 화면 표시 */}
            {isAuthenticated ? renderMyPageScreen() : renderLoginScreen()}

            {/* 기능 준비중 팝업 */}
            <Modal
                visible={isFeaturePopupVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeFeaturePopup}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>안내</Text>
                        <Text style={styles.modalMessage}>{popupMessage}</Text>
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={closeFeaturePopup}
                        >
                            <Text style={styles.modalButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 0,
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
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
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
    deleteAccountButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    deleteAccountText: {
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
        marginBottom: 10,
    },
    kakaoButton: {
        height: 48,
        width: '100%',
        backgroundColor: '#FFE812',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    naverButton: {
        height: 48,
        width: '100%',
        backgroundColor: '#1DC800',
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
    kakaoButtonText: {
        textAlign: 'center',
        color: '#000000',
        fontSize: 17,
        fontWeight: 'bold',
    },
    naverButtonText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    defaultProfileContainer: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35,
    },
    defaultProfileText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#666',
    },
    // 모달 스타일
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#3897f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyPageScreen;
