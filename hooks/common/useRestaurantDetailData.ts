import { useState, useEffect } from 'react';
import { Platform, Linking, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { useRestaurantStore } from '../../app/store/_restaurantStore';
import { Comment } from '../../api/models/comment';

const { width } = Dimensions.get('window');

export const useRestaurantDetailData = () => {
    // 전역 상태에서 선택된 레스토랑 정보를 가져옴
    const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
    const resetSelectedRestaurant = useRestaurantStore((state) => state.resetSelectedRestaurant);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // 댓글 관련 상태
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 (임시로 false로 설정)

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

    // 댓글 작성 함수
    const handleCommentSubmit = () => {
        if (!commentText.trim() || !isLoggedIn) return;
        
        // 여기서 API 호출 및 댓글 저장 로직을 구현할 수 있습니다.
        console.log('댓글 작성:', commentText);
        
        // 임시로 댓글 추가 (실제로는 API 응답으로 처리해야 함)
        const newComment: Comment = {
            id: String(Date.now()),
            content: commentText,
            userName: '사용자',
            createdAt: new Date().toISOString(),
            userId: '1',
        };
        
        setComments([...comments, newComment]);
        setCommentText('');
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
        handlePhoneCall,
        handleOpenMap,
        handleImageScroll,
        handleCommentSubmit,
        setCommentText
    };
};
