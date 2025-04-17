import { useState, useEffect } from 'react';
import { Platform, Linking, NativeSyntheticEvent, NativeScrollEvent, Dimensions, Alert } from 'react-native';
import { useRestaurantStore } from '../../app/store/_restaurantStore';
import { useAuthStore } from '../../app/store/_authStore';
import { Comment } from '../../api/models/comment';
import { doc, getDoc, deleteDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/_layout';

const { width } = Dimensions.get('window');

// 상대적 시간 포맷팅 함수
const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffMs = now.getTime() - commentDate.getTime();
    
    // 시간 차이 계산 (초, 분, 시간, 일)
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    // 상대적 시간 표시 로직
    if (diffSec < 10) {
        return '방금 전';
    } else if (diffSec < 60) {
        return `${diffSec}초 전`;
    } else if (diffMin < 60) {
        return `${diffMin}분 전`;
    } else if (diffHour < 24) {
        return `${diffHour}시간 전`;
    } else if (diffDay < 7) {
        return `${diffDay}일 전`;
    } else if (diffDay < 30) {
        return `${Math.floor(diffDay / 7)}주 전`;
    } else if (diffDay < 365) {
        return `${Math.floor(diffDay / 30)}개월 전`;
    } else {
        // 1년 이상 지난 경우 날짜 표시
        const year = commentDate.getFullYear();
        const month = String(commentDate.getMonth() + 1).padStart(2, '0');
        const day = String(commentDate.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }
};

export const useRestaurantDetailData = () => {
    // 전역 상태에서 선택된 레스토랑 정보를 가져옴
    const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
    const resetSelectedRestaurant = useRestaurantStore((state) => state.resetSelectedRestaurant);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // 인증 스토어에서 로그인 상태와 사용자 정보 가져오기
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    // 댓글 삭제 로딩 상태를 관리하는 상태 추가
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

    // 댓글 관련 상태
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 즐겨찾기 관련 상태 추가
    const [isFavorite, setIsFavorite] = useState(false);
    
    // 즐겨찾기 상태 확인 함수 추가
    const checkFavoriteStatus = async () => {
        if (!isAuthenticated || !user?.uid || !selectedRestaurant?.restaurantID) return;
        
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const favorites = userData.favorites || [];
                const isFav = favorites.includes(selectedRestaurant.restaurantID);
                setIsFavorite(isFav);
                console.log("즐겨찾기 상태 확인:", isFav);
            }
        } catch (error) {
            console.error("즐겨찾기 상태 확인 중 오류 발생:", error);
        }
    };

    // 댓글 불러오기 함수
    const fetchComments = async () => {
        if (!selectedRestaurant?.restaurantID) return;
        
        try {
            const docRef = doc(db, "approved", selectedRestaurant.restaurantID);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const restaurantData = docSnap.data();
                const existingComments = restaurantData.comments || [];
                setComments(existingComments);
                console.log("댓글을 성공적으로 불러왔습니다:", existingComments);
            }
        } catch (error) {
            console.error("댓글 불러오기 중 오류 발생:", error);
        }
    };

    useEffect(() => {
        // 컴포넌트가 마운트될 때 선택된 레스토랑 정보를 로그로 출력
        console.log('선택된 레스토랑 정보:', selectedRestaurant);
        
        // 인증 상태 확인하고 로그 출력
        console.log('레스토랑 상세 화면 - 로그인 상태:', isAuthenticated);
        
        // isLoggedIn 상태 업데이트
        setIsLoggedIn(isAuthenticated);

        // 댓글 불러오기
        if (selectedRestaurant?.restaurantID) {
            fetchComments();
            // 즐겨찾기 상태 확인
            checkFavoriteStatus();
        }

        // 컴포넌트가 언마운트될 때 선택된 레스토랑 상태 초기화
        return () => {
            console.log('레스토랑 상세 화면 이탈 - 상태 초기화');
            resetSelectedRestaurant();
        };
    }, [isAuthenticated, selectedRestaurant?.restaurantID]);

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

    // 댓글 작성 메서드
    const handleCommentSubmit = async () => {
        if (!commentText.trim() || !isLoggedIn) return;

        // restaurantID 확인
        const restaurantID = selectedRestaurant?.restaurantID;
        if (!restaurantID) {
            Alert.alert("알림", "레스토랑 정보를 찾을 수 없습니다.");
            return;
        }

        // 로딩 상태 활성화
        setLoading(true);

        // 새로운 댓글 객체 생성 (현재 로그인한 사용자 정보 사용)
        const newComment: Comment = {
            id: String(Date.now()),
            content: commentText,
            userName: user?.displayName || '사용자',
            userProfileImage: user?.photoURL || '',
            createdAt: new Date().toISOString(),
            userId: user?.uid || '1',
        };

        try {
            // 문서 참조 생성
            const docRef = doc(db, "approved", restaurantID);

            // 문서 가져오기
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const restaurantData = docSnap.data();
                console.log("Restaurant Data:", restaurantData);
                
                // 기존 댓글 배열 가져오기 (없으면 빈 배열 사용)
                const currentComments = restaurantData.comments || [];
                
                // 새로운 댓글을 추가한 배열 생성
                const updatedComments = [...currentComments, newComment];
                
                // 업데이트할 데이터 객체 생성
                const updatedRestaurantData = {
                    ...restaurantData,
                    comments: updatedComments
                };
                
                // Firestore 문서 업데이트
                await setDoc(docRef, updatedRestaurantData);
                console.log("댓글이 성공적으로 추가되었습니다.");
                
                // 로컬 상태 업데이트
                setComments(updatedComments);
                setCommentText('');
            } else {
                Alert.alert("알림", "해당 문서를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error('댓글 추가 중 오류 발생:', error);
            Alert.alert("알림", "댓글 추가 중 오류가 발생했습니다.");
        } finally {
            // 로딩 상태 비활성화
            setLoading(false);
        }
    };

    // 즐겨찾기 메서드
    const handleFavorite = async () => {
        console.log("즐겨찾기 메서드 호출");
        console.log("selectedRestaurant", selectedRestaurant);
        const restaurantID = selectedRestaurant?.restaurantID;
        const userID = user?.uid;
        console.log("restaurantID", restaurantID);
        console.log("userID", userID);

        if (!restaurantID || !userID) {
            console.error("레스토랑 ID 또는 사용자 ID가 없습니다.");
            return;
        }

        try {
            // 로딩 상태 활성화
            setLoading(true);
            
            // 사용자 문서 참조 생성
            const userDocRef = doc(db, "users", userID);
            
            // 사용자 문서 가져오기
            const userDocSnapshot = await getDoc(userDocRef);
            
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                // 즐겨찾기 배열 가져오기 (없으면 빈 배열 사용)
                const favorites = userData.favorites || [];
                
                // 현재 레스토랑이 즐겨찾기에 있는지 확인
                const isAlreadyFavorite = favorites.includes(restaurantID);
                
                // 즐겨찾기 상태 토글
                if (isAlreadyFavorite) {
                    // 즐겨찾기에서 제거
                    const updatedFavorites = favorites.filter((id: string) => id !== restaurantID);
                    await setDoc(userDocRef, { ...userData, favorites: updatedFavorites }, { merge: true });
                    console.log("즐겨찾기에서 제거되었습니다.");
                    setIsFavorite(false);
                    // 로딩 상태 비활성화 후 완료 알림 표시
                    Alert.alert("알림", "즐겨찾기에서 제거되었습니다.");
                } else {
                    // 즐겨찾기에 추가
                    const updatedFavorites = [...favorites, restaurantID];
                    await setDoc(userDocRef, { ...userData, favorites: updatedFavorites }, { merge: true });
                    console.log("즐겨찾기에 추가되었습니다.");
                    setIsFavorite(true);
                    // 로딩 상태 비활성화 후 완료 알림 표시
                    Alert.alert("알림", "즐겨찾기에 추가되었습니다.");
                }
            } else {
                // 사용자 문서가 없는 경우, 새로 생성
                await setDoc(userDocRef, { favorites: [restaurantID] });
                console.log("새 사용자 문서를 생성하고 즐겨찾기에 추가했습니다.");
                setIsFavorite(true);
                // 로딩 상태 비활성화 후 완료 알림 표시
                Alert.alert("알림", "즐겨찾기에 추가되었습니다.");
            }
        } catch (error) {
            console.error("즐겨찾기 처리 중 오류 발생:", error);
            // 오류 발생 시 알림 표시
            Alert.alert("오류", "즐겨찾기 처리 중 문제가 발생했습니다.");
        } finally {
            // 로딩 상태 종료
            setLoading(false);
        }
    };

    // 댓글 삭제 메서드
    const handleDeleteComment = async (commentId: string) => {
        // restaurantID 확인
        const restaurantID = selectedRestaurant?.restaurantID;
        if (!restaurantID) {
            Alert.alert("알림", "레스토랑 정보를 찾을 수 없습니다.");
            return;
        }

        // 삭제 확인 대화상자 표시
        Alert.alert(
            "댓글 삭제",
            "이 댓글을 정말 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                { 
                    text: "삭제", 
                    style: "destructive",
                    onPress: async () => {
                        // 해당 댓글의 로딩 상태 활성화
                        setDeletingCommentId(commentId);
                        
                        try {
                            // 문서 참조 생성
                            const docRef = doc(db, "approved", restaurantID);
                            
                            // 문서 가져오기
                            const docSnap = await getDoc(docRef);
                            
                            if (docSnap.exists()) {
                                const restaurantData = docSnap.data();
                                
                                // 기존 댓글 배열 가져오기
                                const currentComments = restaurantData.comments || [];
                                
                                // 삭제할 댓글을 제외한 새 배열 생성
                                const updatedComments = currentComments.filter(
                                    (comment: Comment) => comment.id !== commentId
                                );
                                
                                // 업데이트할 데이터 객체 생성
                                const updatedRestaurantData = {
                                    ...restaurantData,
                                    comments: updatedComments
                                };
                                
                                // Firestore 문서 업데이트
                                await setDoc(docRef, updatedRestaurantData);
                                console.log("댓글이 성공적으로 삭제되었습니다.");
                                
                                // 로컬 상태 업데이트
                                setComments(updatedComments);
                                
                                // 성공 알림 표시
                                Alert.alert("알림", "댓글이 삭제되었습니다.");
                            } else {
                                Alert.alert("알림", "해당 문서를 찾을 수 없습니다.");
                            }
                        } catch (error) {
                            console.error('댓글 삭제 중 오류 발생:', error);
                            Alert.alert("알림", "댓글 삭제 중 오류가 발생했습니다.");
                        } finally {
                            // 해당 댓글의 로딩 상태 비활성화
                            setDeletingCommentId(null);
                        }
                    }
                }
            ]
        );
    };

    // 현재 사용자의 댓글인지 확인하는 함수
    const isCurrentUserComment = (userId: string) => {
        return user?.uid === userId;
    };

    // 이미지 배열 준비 (없으면 기본 이미지 표시)
    const imageUrls = selectedRestaurant?.imageURLs && selectedRestaurant.imageURLs.length > 0 
        ? selectedRestaurant.imageURLs 
        : ['https://via.placeholder.com/400x200?text=No+Image'];
    
    // 이미지가 여러 개인지 확인
    const hasMultipleImages = imageUrls.length > 1;

    return {
        selectedRestaurant,
        imageUrls,
        hasMultipleImages,
        activeImageIndex,
        comments,
        commentText,
        isLoggedIn,
        loading,
        deletingCommentId,
        isFavorite,
        handlePhoneCall,
        handleOpenMap,
        handleImageScroll,
        handleCommentSubmit,
        setCommentText,
        formatRelativeTime,
        handleFavorite,
        handleDeleteComment,
        isCurrentUserComment,
    };
};
