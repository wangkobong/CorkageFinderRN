import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, StatusBar } from 'react-native';
import { useRestaurantStore } from '../../store/_restaurantStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { RestaurantCategoryInfo } from '../../../api/models/restaurant_category';

const { width } = Dimensions.get('window');

const RestaurantDetailScreen = () => {
    // 전역 상태에서 선택된 레스토랑 정보를 가져옴
    const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
    const resetSelectedRestaurant = useRestaurantStore((state) => state.resetSelectedRestaurant);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        // 컴포넌트가 마운트될 때 선택된 레스토랑 정보를 로그로 출력
        console.log('선택된 레스토랑 정보:', selectedRestaurant);

        // 컴포넌트가 언마운트될 때 선택된 레스토랑 상태 초기화
        return () => {
            console.log('레스토랑 상세 화면 이탈 - 상태 초기화');
            resetSelectedRestaurant();
        };
    }, []);

    // 전화 걸기 기능
    const handlePhoneCall = () => {
        if (selectedRestaurant?.phoneNumber) {
            Linking.openURL(`tel:${selectedRestaurant.phoneNumber}`);
        }
    };

    // 지도 앱 열기 기능
    const handleOpenMap = () => {
        if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
            const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${selectedRestaurant.latitude},${selectedRestaurant.longitude}`;
            const label = selectedRestaurant.name;
            const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });

            if (url) {
                Linking.openURL(url);
            }
        }
    };

    // 이미지 변경 이벤트 핸들러
    const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveImageIndex(slideIndex);
    };

    // 선택된 레스토랑이 없는 경우 처리
    if (!selectedRestaurant) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.noDataContainer}>
                    <Feather name="alert-circle" size={50} color="#ccc" />
                    <Text style={styles.noDataText}>레스토랑 정보를 불러올 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 이미지 배열 준비 (없으면 기본 이미지 표시)
    const imageUrls = selectedRestaurant.imageURLs && selectedRestaurant.imageURLs.length > 0 
        ? selectedRestaurant.imageURLs 
        : ['https://via.placeholder.com/400x200?text=No+Image'];
    
    // 이미지가 여러 개인지 확인
    const hasMultipleImages = imageUrls.length > 1;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* 헤더 이미지 슬라이더 - SafeAreaView 바깥에 배치 */}
            <View style={styles.imageSliderContainer}>
                <FlatList
                    data={imageUrls}
                    horizontal
                    pagingEnabled
                    scrollEnabled={hasMultipleImages} // 이미지가 1개일 때는 스크롤 비활성화
                    showsHorizontalScrollIndicator={false}
                    onScroll={hasMultipleImages ? handleImageScroll : undefined} // 이미지가 1개일 때는 스크롤 이벤트 비활성화
                    renderItem={({ item }) => (
                        <Image 
                            source={{ uri: item }} 
                            style={styles.sliderImage} 
                        />
                    )}
                    keyExtractor={(item, index) => `image-${index}`}
                />
                
                {/* 이미지 인디케이터 - 이미지가 여러 개일 때만 표시 */}
                {hasMultipleImages && (
                    <View style={styles.paginationContainer}>
                        {imageUrls.map((_, index) => (
                            <View
                                key={`dot-${index}`}
                                style={[
                                    styles.paginationDot,
                                    index === activeImageIndex ? styles.paginationDotActive : {}
                                ]}
                            />
                        ))}
                    </View>
                )}
                
                <View style={styles.imageOverlay}>
                    <Text style={styles.overlayCategory}>
                        {RestaurantCategoryInfo.getEmoji(selectedRestaurant.category)} {RestaurantCategoryInfo.getTitle(selectedRestaurant.category)}
                    </Text>
                </View>
            </View>
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
            >
                {/* 레스토랑 기본 정보 */}
                <View style={styles.restaurantInfoSection}>
                    <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                    <View style={styles.locationContainer}>
                        <Feather name="map-pin" size={16} color="#666" />
                        <Text style={styles.locationText}>
                            {selectedRestaurant.sido} {selectedRestaurant.sigungu} {selectedRestaurant.address}
                            {selectedRestaurant.addressDetail ? `, ${selectedRestaurant.addressDetail}` : ''}
                        </Text>
                    </View>
                </View>

                {/* 액션 버튼 */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={handlePhoneCall}
                        disabled={!selectedRestaurant.phoneNumber}
                    >
                        <Feather name="phone" size={20} color="#4A6572" />
                        <Text style={styles.actionButtonText}>전화하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleOpenMap}
                        disabled={!selectedRestaurant.latitude || !selectedRestaurant.longitude}
                    >
                        <Feather name="map" size={20} color="#4A6572" />
                        <Text style={styles.actionButtonText}>지도보기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="heart" size={20} color="#4A6572" />
                        <Text style={styles.actionButtonText}>저장</Text>
                    </TouchableOpacity>
                </View>

                {/* 콜키지 정보 */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Feather name="shopping-bag" size={22} color="#F9A826" />
                        <Text style={styles.cardTitle}>콜키지 정보</Text>
                    </View>
                    <Text style={[styles.corkageText, selectedRestaurant.isCorkageFree ? styles.corkageFree : {}]}>
                        {selectedRestaurant.isCorkageFree ? '✓ 콜키지 무료' : `콜키지 비용: ${selectedRestaurant.corkageFee}`}
                    </Text>
                    {selectedRestaurant.corkageNote && (
                        <View style={styles.noteContainer}>
                            <Text style={styles.noteTitle}>추가 안내사항:</Text>
                            <Text style={styles.noteText}>{selectedRestaurant.corkageNote}</Text>
                        </View>
                    )}
                </View>

                {/* 영업 정보 */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Feather name="clock" size={22} color="#F9A826" />
                        <Text style={styles.cardTitle}>영업 정보</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>영업시간:</Text>
                        <Text style={styles.infoValue}>{selectedRestaurant.businessHours}</Text>
                    </View>
                    {selectedRestaurant.isBreaktime && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>브레이크타임:</Text>
                            <Text style={styles.infoValue}>{selectedRestaurant.breaktime}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>휴무일:</Text>
                        <Text style={styles.infoValue}>{selectedRestaurant.closedDays || '정보 없음'}</Text>
                    </View>
                </View>

                {/* 취급 음료 카테고리 */}
                {selectedRestaurant.drinkCategories && selectedRestaurant.drinkCategories.length > 0 && (
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <Feather name="info" size={22} color="#F9A826" />
                            <Text style={styles.cardTitle}>취급 음료</Text>
                        </View>
                        <View style={styles.drinkCategoriesContainer}>
                            {selectedRestaurant.drinkCategories.map((category, index) => (
                                <View key={index} style={styles.drinkCategoryTag}>
                                    <Text style={styles.drinkCategoryText}>{category}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                
                {/* 하단 여백 */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

export default RestaurantDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        paddingTop: 0,  // 상단 패딩 제거
    },
    bottomSpacer: {
        height: 30,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noDataText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    imageSliderContainer: {
        width: '100%',
        height: 250,
        position: 'relative',
        zIndex: 1,
    },
    sliderImage: {
        width: width,
        height: 250,
        resizeMode: 'cover',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 12,
        height: 8,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    overlayCategory: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    restaurantInfoSection: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        flexShrink: 1,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        marginTop: 4,
        fontSize: 14,
        color: '#666',
    },
    infoCard: {
        margin: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        color: '#333',
    },
    corkageText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    corkageFree: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    noteContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#555',
    },
    noteText: {
        fontSize: 14,
        color: '#666',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        width: 100,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    drinkCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    drinkCategoryTag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    drinkCategoryText: {
        fontSize: 13,
        color: '#2E7D32',
    },
});
