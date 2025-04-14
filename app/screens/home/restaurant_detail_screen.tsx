import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, FlatList, Dimensions, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RestaurantCategoryInfo } from '../../../api/models/restaurant_category';
import { useRestaurantDetailData } from '../../../hooks/common/useRestaurantDetailData';
import { DRINK_CATEGORIES } from '../../../api/models/drink_category';
import { useAuthStore } from '../../../app/store/_authStore';

const { width } = Dimensions.get('window');

const RestaurantDetailScreen = () => {
    // useRestaurantDetailData 훅 사용
    const {
        selectedRestaurant,
        imageUrls,
        hasMultipleImages,
        activeImageIndex,
        comments,
        commentText,
        isLoggedIn,
        loading,
        isFavorite,
        handlePhoneCall,
        handleOpenMap,
        handleImageScroll,
        handleCommentSubmit,
        setCommentText,
        formatRelativeTime,
        handleFavorite,
    
    } = useRestaurantDetailData();

    const imageSection = () => {
        if (!selectedRestaurant) return null;
        
        return (
            <View style={styles.imageSliderContainer}>
                <FlatList
                    data={imageUrls}
                    horizontal
                    pagingEnabled
                    scrollEnabled={hasMultipleImages}
                    showsHorizontalScrollIndicator={false}
                    onScroll={hasMultipleImages ? handleImageScroll : undefined}
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
        );
    };

    const mainInfoSection = () => {
        if (!selectedRestaurant) return null;
        
        return (
            <>
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
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {
                            if (!isLoggedIn) {
                                // 로그인하지 않은 경우 로그인 메시지 표시
                                alert('즐겨찾기를 사용하려면 로그인이 필요합니다.');
                            } else {
                                // 로그인한 경우 즐겨찾기 기능 사용
                                handleFavorite();
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#4A6572" />
                        ) : (
                            <>
                                {isFavorite ? (
                                    <Feather name="heart" size={20} color="#FF6B6B" />
                                ) : (
                                    <Feather name="heart" size={20} color="#4A6572" />
                                )}
                                <Text style={[
                                    styles.actionButtonText,
                                    isFavorite && { color: '#FF6B6B', fontWeight: 'bold' }
                                ]}>
                                    {isFavorite ? '저장됨' : '저장'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    const corkageInfoSection = () => {
        if (!selectedRestaurant) return null;
        
        // 콜키지 비용 표시를 위한 함수 (가격에 콤마 추가)
        const formatCorkageFee = (fee: string) => {
            // 숫자만 추출
            const numberOnly = fee.replace(/[^0-9]/g, '');
            if (!numberOnly) return fee;
            
            // 숫자에 콤마 추가
            const formatted = Number(numberOnly).toLocaleString();
            
            // 원본 문자열에서 숫자를 포맷된 숫자로 교체
            return fee.replace(numberOnly, formatted);
        };
        
        return (
            <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                    <Feather name="shopping-bag" size={22} color="#F9A826" />
                    <Text style={styles.cardTitle}>콜키지 정보</Text>
                </View>
                
                {/* 콜키지 무료/비용 정보 */}
                <View style={styles.corkageStatusContainer}>
                    <View style={[
                        styles.corkageBadge,
                        selectedRestaurant.isCorkageFree ? styles.corkageFreeBadge : styles.corkageFeeBadge
                    ]}>
                        <Text style={[
                            styles.corkageBadgeText,
                            selectedRestaurant.isCorkageFree ? styles.corkageFreeBadgeText : styles.corkageFeeBadgeText
                        ]}>
                            {selectedRestaurant.isCorkageFree ? '무료' : '유료'}
                        </Text>
                    </View>
                    
                    {selectedRestaurant.isCorkageFree ? (
                        <Text style={[styles.corkageText, styles.corkageFree]}>
                            콜키지 비용이 무료입니다
                        </Text>
                    ) : (
                        <View style={styles.corkageFeeContainer}>
                            <Text style={styles.corkageText}>콜키지 비용:</Text>
                            <Text style={styles.corkageFeeText}>
                                {formatCorkageFee(selectedRestaurant.corkageFee)}
                            </Text>
                        </View>
                    )}
                </View>
                
                {/* 추가 안내사항 */}
                {selectedRestaurant.corkageNote && (
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteTitle}>추가 안내사항:</Text>
                        <Text style={styles.noteText}>{selectedRestaurant.corkageNote}</Text>
                    </View>
                )}
                
                {/* 취급 음료 카테고리 */}
                {selectedRestaurant.drinkCategories && selectedRestaurant.drinkCategories.length > 0 && (
                    <View style={styles.drinkCategorySection}>
                        <Text style={styles.drinkCategoryTitle}>취급 음료</Text>
                        <View style={styles.drinkCategoriesContainer}>
                            {selectedRestaurant.drinkCategories.map((category, index) => {
                                const drinkInfo = DRINK_CATEGORIES.find(c => c.id === category);
                                return (
                                    <View key={index} style={styles.drinkCategoryTag}>
                                        <Text style={styles.drinkCategoryText}>
                                            {drinkInfo?.emoji} {drinkInfo?.title || category}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const businessInfoSection = () => {
        if (!selectedRestaurant) return null;
        
        return (
            <>
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Feather name="clock" size={22} color="#F9A826" />
                        <Text style={styles.cardTitle}>영업 정보</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>전화번호:</Text>
                        <Text style={styles.infoValue}>
                            {selectedRestaurant.phoneNumber || '정보 없음'}
                        </Text>
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
            </>
        );
    };

    const commentSection = () => {
        return (
            <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                    <Feather name="message-circle" size={22} color="#F9A826" />
                    <Text style={styles.cardTitle}>방문자 댓글</Text>
                </View>
                
                {/* 댓글 목록 */}
                {comments.length > 0 ? (
                    <View style={styles.commentsContainer}>
                        {comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentHeader}>
                                    {comment.userProfileImage ? (
                                        <Image 
                                            source={{ uri: comment.userProfileImage }} 
                                            style={styles.commentUserImage} 
                                        />
                                    ) : (
                                        <View style={styles.commentUserImagePlaceholder}>
                                            <Feather name="user" size={14} color="#999" />
                                        </View>
                                    )}
                                    <Text style={styles.commentUserName}>{comment.userName}</Text>
                                    <Text style={styles.commentDate}>{formatRelativeTime(comment.createdAt)}</Text>
                                </View>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noCommentsContainer}>
                        <Feather name="message-square" size={40} color="#ddd" />
                        <Text style={styles.noCommentsText}>아직 댓글이 없습니다.</Text>
                        <Text style={styles.noCommentsSubText}>첫 번째 댓글을 남겨보세요!</Text>
                    </View>
                )}
                
                {/* 댓글 작성 영역 */}
                {isLoggedIn ? (
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="댓글을 입력하세요..."
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[
                                styles.commentSubmitButton,
                                !commentText.trim() && styles.commentSubmitButtonDisabled
                            ]}
                            disabled={!commentText.trim()}
                            onPress={handleCommentSubmit}
                        >
                            <Feather name="send" size={18} color={commentText.trim() ? "#fff" : "#ccc"} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginPromptContainer}>
                        <Feather name="lock" size={16} color="#666" />
                        <Text style={styles.loginPromptText}>댓글을 작성하려면 로그인이 필요합니다.</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* 헤더 이미지 슬라이더 - SafeAreaView 바깥에 배치 */}
            {imageSection()}
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
            >
                {/* 레스토랑 기본 정보 및 액션 버튼 */}
                {mainInfoSection()}

                {/* 콜키지 정보 */}
                {corkageInfoSection()}

                {/* 영업 정보 및 취급 음료 */}
                {businessInfoSection()}
                
                {/* 댓글 섹션 */}
                {commentSection()}
                
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
    corkageStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    corkageBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 10,
    },
    corkageBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    corkageFreeBadge: {
        backgroundColor: '#E8F5E9',
    },
    corkageFreeBadgeText: {
        color: '#2E7D32',
    },
    corkageFeeBadge: {
        backgroundColor: '#FFF3E0',
    },
    corkageFeeBadgeText: {
        color: '#F9A826',
    },
    corkageText: {
        fontSize: 16,
        color: '#555',
    },
    corkageFree: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    corkageFeeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    corkageFeeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F9A826',
        marginLeft: 5,
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
    drinkCategorySection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    drinkCategoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
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
    // 댓글 섹션 스타일
    commentsContainer: {
        marginTop: 8,
    },
    commentItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentUserImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    commentUserImagePlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    commentUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    commentDate: {
        fontSize: 12,
        color: '#999',
        marginLeft: 'auto',
        fontWeight: '400',
        backgroundColor: '#f6f6f6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    commentContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    noCommentsContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    noCommentsText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginTop: 8,
    },
    noCommentsSubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    commentInputContainer: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'flex-end',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        padding: 10,
        paddingVertical: 8,
        maxHeight: 100,
        backgroundColor: '#f9f9f9',
    },
    commentSubmitButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F9A826',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    commentSubmitButtonDisabled: {
        backgroundColor: '#eee',
    },
    loginPromptContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    loginPromptText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
});
