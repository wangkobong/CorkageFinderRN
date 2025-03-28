import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import DateTimePicker from '@react-native-community/datetimepicker';
import KakaoApiManager from '../../services/KakaoApiManager';
import * as ImagePicker from 'expo-image-picker';
import { RestaurantRegisterService } from '../../services/RestaurantRegisterService';
import { HomeRestaurantCategory } from '../../models/restaurant_category';
import { GeocodingResponse } from '../../models/geocoding';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../_layout';
import { onAuthStateChanged } from 'firebase/auth';
import { DrinkCategory, DRINK_CATEGORIES } from '../../models/drink_category';
import { RestaurantCard, RestaurantCardImpl } from '../../models/restaurant';

// 섹션 헤더 컴포넌트
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const RegisterScreen = () => {
    const navigation = useNavigation();
    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 로딩 상태
    const [authLoading, setAuthLoading] = useState(true);
    // 뷰만 구현하기 위한 상태값들 (실제 로직은 구현하지 않음)
    const [restaurantName, setRestaurantName] = useState('');
    const [category, setCategory] = useState('');
    const [isCorkageFree, setIsCorkageFree] = useState(false);
    const [corkageFee, setCorkageFee] = useState('');
    const [corkageMemo, setCorkageMemo] = useState('');
    const [location, setLocation] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [businessHours, setBusinessHours] = useState('');
    const [closedDays, setClosedDays] = useState('');
    const [breakTime, setBreakTime] = useState('');
    const [isBreakTimeEnabled, setIsBreakTimeEnabled] = useState(false);
    const [memoHeight, setMemoHeight] = useState(40);
    // 영업 시간 관련 상태들
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('18:00');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSettingOpenTime, setIsSettingOpenTime] = useState(true);
    const [date, setDate] = useState(new Date());
    // 브레이크타임 관련 상태 추가
    const [breakTimeStart, setBreakTimeStart] = useState('14:00');
    const [breakTimeEnd, setBreakTimeEnd] = useState('17:00');
    const [isSettingBreakTimeStart, setIsSettingBreakTimeStart] = useState(true);
    const [showBreakTimePicker, setShowBreakTimePicker] = useState(false);
    const [breakTimeDate, setBreakTimeDate] = useState(new Date());
    // 이미지 관련 상태
    const [images, setImages] = useState<string[]>([]);
    const MAX_IMAGES = 5;
    // 로딩 상태
    const [isLoading, setIsLoading] = useState(false);
    // 지오코딩 응답 저장
    const [geocodingResponse, setGeocodingResponse] = useState<GeocodingResponse | null>(null);
    // 카테고리 모달 표시 상태
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    // 선택된 카테고리 ID (enum)
    const [selectedCategoryId, setSelectedCategoryId] = useState<HomeRestaurantCategory | null>(null);

    // 휴무일 모달 표시 상태
    const [showClosedDaysModal, setShowClosedDaysModal] = useState(false);
    // 선택된 휴무일 배열
    const [selectedClosedDays, setSelectedClosedDays] = useState<string[]>([]);

    // 저장 버튼 활성화 상태
    const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

    // 음료 카테고리 선택 상태 추가
    const [selectedDrinkCategories, setSelectedDrinkCategories] = useState<DrinkCategory[]>([]);
    // 음료 카테고리 모달 표시 상태
    const [showDrinkCategoryModal, setShowDrinkCategoryModal] = useState(false);

    // KakaoApiManager 인스턴스 생성
    const kakaoApiManager = new KakaoApiManager();

    // 카테고리 목록
    const categories = [
        { id: HomeRestaurantCategory.KOREAN, title: '한식', emoji: '🥘' },
        { id: HomeRestaurantCategory.JAPANESE, title: '일식', emoji: '🍣' },
        { id: HomeRestaurantCategory.CHINESE, title: '중식', emoji: '🥟' },
        { id: HomeRestaurantCategory.WESTERN, title: '양식', emoji: '🍝' },
        { id: HomeRestaurantCategory.ASIAN, title: '아시안', emoji: '🍜' },
        { id: HomeRestaurantCategory.ETC, title: '기타', emoji: '🥡' },
    ];

    // 요일 목록
    const weekdays = [
        { id: 'monday', title: '월요일' },
        { id: 'tuesday', title: '화요일' },
        { id: 'wednesday', title: '수요일' },
        { id: 'thursday', title: '목요일' },
        { id: 'friday', title: '금요일' },
        { id: 'saturday', title: '토요일' },
        { id: 'sunday', title: '일요일' },
    ];

    // 카테고리 선택 함수
    const selectCategory = (categoryTitle: string, categoryId: HomeRestaurantCategory) => {
        setCategory(categoryTitle);
        setSelectedCategoryId(categoryId);
        setShowCategoryModal(false);
    };

    // 휴무일 선택 상태 토글 함수
    const toggleClosedDay = (day: string) => {
        if (selectedClosedDays.includes(day)) {
            // 이미 선택된 경우 제거
            setSelectedClosedDays(selectedClosedDays.filter(d => d !== day));
        } else {
            // 선택되지 않은 경우 추가
            setSelectedClosedDays([...selectedClosedDays, day]);
        }
    };

    // 휴무일 선택 완료
    const confirmClosedDays = () => {
        // 선택된 휴무일을 문자열로 변환
        const closedDaysString = selectedClosedDays
            .map(id => weekdays.find(day => day.id === id)?.title || '')
            .filter(Boolean)
            .join(', ');
        
        setClosedDays(closedDaysString);
        setShowClosedDaysModal(false);
    };

    // 음료 카테고리 선택 토글 함수
    const toggleDrinkCategory = (category: DrinkCategory) => {
        if (selectedDrinkCategories.includes(category)) {
            // 이미 선택된 경우 제거
            setSelectedDrinkCategories(selectedDrinkCategories.filter(c => c !== category));
        } else {
            // 선택되지 않은 경우 추가
            setSelectedDrinkCategories([...selectedDrinkCategories, category]);
        }
    };

    // 음료 카테고리 선택 완료
    const confirmDrinkCategories = () => {
        setShowDrinkCategoryModal(false);
    };

    // 컴포넌트 마운트 시 이미 설정된 휴무일이 있다면 선택 상태 초기화
    useEffect(() => {
        if (closedDays) {
            const dayTitles = closedDays.split(', ');
            const dayIds = dayTitles
                .map(title => weekdays.find(day => day.title === title)?.id)
                .filter(Boolean) as string[];
            
            setSelectedClosedDays(dayIds);
        }
    }, []);

    const tryGeocoding = async (address: string) => {

        if (!address || address.trim() === '') {
            console.log('주소가 비어있습니다');
            return;
        }
        
        try {
            console.log('KakaoApiManager 호출 시작');
            const response = await kakaoApiManager.searchAddress(address);
            console.log('지오코딩 응답:', response);
            
            // 응답 데이터 저장 (나중에 좌표로 사용하기 위해)
            setGeocodingResponse(response);
            
            // 응답 데이터가 있고, 최소 하나의 결과가 있는지 확인
            if (response.documents && response.documents.length > 0) {
                const x = response.documents[0].x;
                const y = response.documents[0].y;
                console.log('x:', x);
                console.log('y:', y);
                
                // 주소 확인이 성공했으므로 상태 설정
                setIsAddressVerified(true);
                
                // 기본 주소를 검색 결과로 업데이트 (필요한 경우)
                const fullAddress = response.documents[0].address_name;
                if (fullAddress) {
                    setLocation(fullAddress);
                }
            } else {
                console.log('주소 검색 결과가 없습니다');
                setIsAddressVerified(false);
            }
        } catch (error) {
            console.error('지오코딩 오류:', error);
            setIsAddressVerified(false);
        }
    }

    // 시간 선택기를 보여주는 함수
    const showTimePickerModal = (isOpen: boolean) => {
        // 현재 시간 문자열을 Date 객체로 변환
        const timeString = isOpen ? openTime : closeTime;
        const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
        
        const newDate = new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setDate(newDate);
        
        setIsSettingOpenTime(isOpen);
        setShowTimePicker(true);
    };
    
    // 브레이크타임 시간 선택기를 보여주는 함수
    const showBreakTimePickerModal = (isStart: boolean) => {
        // 현재 시간 문자열을 Date 객체로 변환
        const timeString = isStart ? breakTimeStart : breakTimeEnd;
        const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
        
        const newDate = new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setBreakTimeDate(newDate);
        
        setIsSettingBreakTimeStart(isStart);
        setShowBreakTimePicker(true);
    };
    
    // 시간 선택기에서 시간이 선택되었을 때 실행되는 함수
    const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
        // Android에서만 자동으로 닫힘, iOS에서는 버튼으로 닫아야 함
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
            
            if (selectedTime) {
                setDate(selectedTime);
                applySelectedTime(selectedTime);
            }
        } else {
            // iOS에서는 시간을 선택해도 피커가 닫히지 않고, 선택된 시간을 임시 저장
            if (selectedTime) {
                setDate(selectedTime);
            }
        }
    };

    // 브레이크타임 시간 선택기에서 시간이 선택되었을 때 실행되는 함수
    const handleBreakTimeChange = (event: any, selectedTime: Date | undefined) => {
        // Android에서만 자동으로 닫힘, iOS에서는 버튼으로 닫아야 함
        if (Platform.OS === 'android') {
            setShowBreakTimePicker(false);
            
            if (selectedTime) {
                setBreakTimeDate(selectedTime);
                applySelectedBreakTime(selectedTime);
            }
        } else {
            // iOS에서는 시간을 선택해도 피커가 닫히지 않고, 선택된 시간을 임시 저장
            if (selectedTime) {
                setBreakTimeDate(selectedTime);
            }
        }
    };

    // 선택한 시간을 적용하는 함수 추가
    const applySelectedTime = (selectedDate: Date) => {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        if (isSettingOpenTime) {
            setOpenTime(timeString);
        } else {
            setCloseTime(timeString);
        }
    };

    // 선택한 브레이크타임을 적용하는 함수 추가
    const applySelectedBreakTime = (selectedDate: Date) => {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        if (isSettingBreakTimeStart) {
            setBreakTimeStart(timeString);
        } else {
            setBreakTimeEnd(timeString);
        }
        
        // 브레이크타임 문자열 업데이트
        updateBreakTimeString();
    };
    
    // 브레이크타임 문자열 업데이트 함수
    const updateBreakTimeString = () => {
        const breakTimeStr = `${breakTimeStart}~${breakTimeEnd}`;
        setBreakTime(breakTimeStr);
    };

    // 브레이크타임 변경 시 문자열 업데이트
    useEffect(() => {
        if (isBreakTimeEnabled) {
            updateBreakTimeString();
        }
    }, [breakTimeStart, breakTimeEnd, isBreakTimeEnabled]);

    // 피커 확인 버튼 처리
    const handleConfirmTime = () => {
        applySelectedTime(date);
        setShowTimePicker(false);
    };
    
    // 브레이크타임 피커 확인 버튼 처리
    const handleConfirmBreakTime = () => {
        applySelectedBreakTime(breakTimeDate);
        setShowBreakTimePicker(false);
    };

    // 이미지 픽커 실행 함수
    const pickImage = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('알림', '최대 5개의 이미지까지 추가할 수 있습니다.');
            return;
        }

        // 미디어 라이브러리 권한 요청
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('알림', '앨범 접근 권한이 필요합니다.');
            return;
        }
        
        // 이미지 픽커 실행
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        
        if (!result.canceled && result.assets.length > 0) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    // 이미지 삭제 함수
    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    // 카테고리 문자열을 enum으로 변환하는 함수 (수정)
    const getCategoryEnum = (): HomeRestaurantCategory => {
        // selectedCategoryId가 있으면 그대로 반환
        if (selectedCategoryId) {
            return selectedCategoryId;
        }
        
        // 없으면 텍스트로 매핑 (기존 로직 유지)
        switch (category.trim().toLowerCase()) {
            case '한식': return HomeRestaurantCategory.KOREAN;
            case '일식': return HomeRestaurantCategory.JAPANESE;
            case '중식': return HomeRestaurantCategory.CHINESE;
            case '양식': return HomeRestaurantCategory.WESTERN;
            case '아시안': return HomeRestaurantCategory.ASIAN;
            default: return HomeRestaurantCategory.ETC;
        }
    };

    // 필수 입력 요소 유효성 검사
    useEffect(() => {
        // 이름, 카테고리, 주소 검증, 전화번호, 영업시간 체크
        const isNameValid = restaurantName.trim() !== '';
        const isCategoryValid = category.trim() !== '';
        const isAddressValid = location.trim() !== '' && isAddressVerified;
        const isPhoneValid = phoneNumber.trim() !== '';
        const isTimeValid = openTime !== '' && closeTime !== '';
        
        // 콜키지 정보 체크 (무료면 비용 필요 없음)
        const isCorkageValid = isCorkageFree || (!isCorkageFree && corkageFee.trim() !== '');
        
        // 브레이크타임 체크 (활성화 되었으면 시간도 설정되어야 함)
        const isBreakTimeValid = !isBreakTimeEnabled || (isBreakTimeEnabled && breakTimeStart !== '' && breakTimeEnd !== '');
        
        // 음료 카테고리 체크 (최소 1개 이상 선택)
        const isDrinkCategoryValid = selectedDrinkCategories.length > 0;
        
        // 모든 조건이 충족되면 버튼 활성화
        const isFormValid = isNameValid && isCategoryValid && isAddressValid && 
                           isPhoneValid && isTimeValid && isCorkageValid && 
                           isBreakTimeValid && isDrinkCategoryValid;
        
        setIsSaveButtonEnabled(isFormValid);
    }, [restaurantName, category, location, isAddressVerified, phoneNumber, 
        openTime, closeTime, isCorkageFree, corkageFee, isBreakTimeEnabled, 
        breakTimeStart, breakTimeEnd, selectedDrinkCategories]);

    // 콜키지 금액 포맷팅 함수 수정
    const formatCorkageFee = (value: string) => {
        // 빈 문자열이면 빈 문자열 반환
        if (value === '') {
            return '';
        }
        
        // 숫자가 아닌 문자 제거
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // 숫자가 없으면 빈 문자열 반환
        if (numericValue === '') {
            return '';
        }
        
        // 천 단위 콤마 추가 (원 표시 제거)
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // 콜키지 금액 입력 처리 함수 수정
    const handleCorkageFeeChange = (value: string) => {
        // 숫자와 쉼표만 남기고 제거
        const numericValue = value.replace(/[^0-9,]/g, '').replace(/,/g, '');
        setCorkageFee(numericValue);
    };
    
    // 콜키지 금액 표시용 포맷팅된 값
    const [formattedCorkageFee, setFormattedCorkageFee] = useState('');
    
    // 콜키지 금액이 변경될 때마다 포맷팅된 값 업데이트
    useEffect(() => {
        setFormattedCorkageFee(formatCorkageFee(corkageFee));
    }, [corkageFee]);

    // 폼 초기화 함수
    const resetForm = () => {
        setRestaurantName('');
        setCategory('');
        setSelectedCategoryId(null);
        setIsCorkageFree(false);
        setCorkageFee('');
        setCorkageMemo('');
        setLocation('');
        setDetailAddress('');
        setIsAddressVerified(false);
        setPhoneNumber('');
        setClosedDays('');
        setSelectedClosedDays([]);
        setBreakTime('');
        setBreakTimeStart('14:00');
        setBreakTimeEnd('17:00');
        setIsBreakTimeEnabled(false);
        setImages([]);
        setGeocodingResponse(null);
        setSelectedDrinkCategories([]);
    };

    // 저장 버튼 클릭 시 호출되는 함수 (수정)
    const handleSave = async () => {
        try {
            // 버튼이 비활성화 상태이면 함수 실행하지 않음
            if (!isSaveButtonEnabled) return;
            
            // 로딩 상태 시작
            setIsLoading(true);
            
            // 필수 입력값 검증
            if (!restaurantName || !location || !isAddressVerified || !category) {
                Alert.alert('입력 오류', '필수 정보를 모두 입력해주세요.');
                return;
            }
            
            // 1. 이미지 업로드
            let imageURLs: string[] = [];
            if (images.length > 0) {
                try {
                    // 이미지 객체 배열을 RestaurantRegisterService에 전달
                    const imageObjects = images.map(uri => ({ uri }));
                    imageURLs = await RestaurantRegisterService.uploadImages(imageObjects);
                } catch (error) {
                    console.error('이미지 업로드 실패:', error);
                    Alert.alert('오류', '이미지 업로드 중 문제가 발생했습니다.');
                    setIsLoading(false);
                    return;
                }
            }
            
            // 2. 영업시간 문자열 생성
            const businessHoursStr = `${openTime}~${closeTime}`;
            
            // 3. geocodingResponse에서 위도, 경도 정보 추출 (주소 검증 시 저장했던 값)
            let latitude = 0;
            let longitude = 0;
            let sido = '';
            let sigungu = '';
            
            if (geocodingResponse && geocodingResponse.documents.length > 0) {
                const document = geocodingResponse.documents[0];
                latitude = parseFloat(document.y);
                longitude = parseFloat(document.x);
                
                // 주소 정보에서 시/도, 시/군/구 정보 추출
                if (document.address) {
                    sido = document.address.region_1depth_name || '';
                    sigungu = document.address.region_2depth_name || '';
                }
            }
            
            // 4. 레스토랑 데이터 객체 생성
            const categoryEnum = getCategoryEnum();
            
            // RestaurantCardImpl 생성자를 사용하여 RestaurantCard 객체 생성
            const restaurantData: RestaurantCard = new RestaurantCardImpl(
                imageURLs,
                restaurantName,
                categoryEnum,
                isCorkageFree,
                isCorkageFree ? '' : corkageFee,
                sido,
                sigungu,
                phoneNumber,
                location,
                detailAddress,
                businessHoursStr,
                closedDays,
                corkageMemo,
                latitude,
                longitude,
                isBreakTimeEnabled,
                isBreakTimeEnabled ? breakTime : '',
                selectedDrinkCategories // 선택된 음료 카테고리 배열
            );
            
            // 5. Firestore에 레스토랑 데이터 저장
            await RestaurantRegisterService.addRestaurant(restaurantData);
            
            // 성공 처리
            setIsLoading(false);
            Alert.alert(
                '등록 완료', 
                '레스토랑 정보가 등록되었습니다. 검토 후 승인될 예정입니다.', 
                [
                    { 
                        text: '확인', 
                        onPress: resetForm
                    }
                ]
            );
            
        } catch (error) {
            setIsLoading(false);
            console.error('레스토랑 등록 실패:', error);
            Alert.alert('오류', '레스토랑 등록 중 문제가 발생했습니다.');
        }
    };

    // 컴포넌트 마운트 시 로그인 상태 확인
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const isUserLoggedIn = await AsyncStorage.getItem('user_logged_in');
                
                if (isUserLoggedIn === 'true') {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
                
                setAuthLoading(false);
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                setAuthLoading(false);
            }
        };
        
        // 로그인 상태 확인
        checkLoginStatus();
        
        // Firebase 인증 상태 리스너
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
            setAuthLoading(false);
        });
        
        // 컴포넌트 언마운트 시 리스너 해제
        return () => unsubscribe();
    }, []);
    
    // 로그인 필요 화면 렌더링
    const renderLoginRequiredScreen = () => (
        <View style={styles.loginRequiredContainer}>
            <Ionicons name="lock-closed-outline" size={60} color="#ccc" style={styles.lockIcon} />
            <Text style={styles.loginRequiredTitle}>로그인이 필요합니다</Text>
            <Text style={styles.loginRequiredText}>
                레스토랑 등록 요청을 위해 로그인이 필요합니다.
                아래 탭에서 마이페이지를 눌러 로그인해주세요.
            </Text>
        </View>
    );

    // 로딩 중이거나 로그인되지 않은 경우 로그인 필요 화면 표시
    if (authLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleContainer}>
                    <TitleText>등록 요청</TitleText>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A6FE7" />
                </View>
            </SafeAreaView>
        );
    }
    
    if (!isLoggedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleContainer}>
                    <TitleText>등록 요청</TitleText>
                </View>
                {renderLoginRequiredScreen()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <View style={styles.titleContainer}>
                    <TitleText>등록 요청</TitleText>
                </View>
                
                {/* 기본 정보 섹션 */}
                <SectionHeader title="기본 정보" />
                <View style={styles.sectionContent}>
                    {/* 이미지 업로드 영역 */}
                    <View style={styles.imageUploadContainer}>
                        <Text style={styles.imageSubtitle}>이미지 (최대 5장)</Text>
                        <View style={styles.imageGalleryContainer}>
                            {/* 이미지 추가 버튼 (5개 미만일 때만 표시) */}
                            {images.length < MAX_IMAGES && (
                                <TouchableOpacity 
                                    style={styles.addMoreButton} 
                                    onPress={pickImage}
                                >
                                    <Text style={styles.addMoreButtonText}>+</Text>
                                    <Text style={styles.addMoreButtonSubtext}>추가</Text>
                                </TouchableOpacity>
                            )}
                            
                            {/* 이미지 썸네일 목록 */}
                            {images.map((uri, index) => (
                                <View key={index} style={styles.thumbnailWrapper}>
                                    <Image 
                                        source={{ uri }} 
                                        style={styles.thumbnail} 
                                    />
                                    <TouchableOpacity 
                                        style={styles.removeThumbnailButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Text style={styles.removeThumbnailButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                    
                    {/* 레스토랑 이름 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={restaurantName}
                            onChangeText={setRestaurantName}
                            placeholder="레스토랑 이름"
                            placeholderTextColor="#888"
                        />
                    </View>
                    
                    {/* 카테고리 (수정) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>카테고리</Text>
                        <TouchableOpacity 
                            style={styles.categorySelector}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <Text style={category ? styles.categorySelectedText : styles.placeholderText}>
                                {category ? `${categories.find(c => c.title === category)?.emoji || ''} ${category}` : '카테고리 선택'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* 콜키지 정보 섹션 */}
                <SectionHeader title="콜키지 정보" />
                <View style={styles.sectionContent}>
                    {/* 콜키지 무료 여부 */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>콜키지 무료</Text>
                        <Switch
                            value={isCorkageFree}
                            onValueChange={setIsCorkageFree}
                            trackColor={{ false: "#d3d3d3", true: "#81b0ff" }}
                            thumbColor={isCorkageFree ? "#ffffff" : "#f4f3f4"}
                        />
                    </View>
                    
                    {/* 콜키지 비용 - 콜키지가 무료가 아닐 때만 표시 */}
                    {!isCorkageFree && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>콜키지 비용</Text>
                            <TextInput
                                style={styles.input}
                                value={formattedCorkageFee}
                                onChangeText={handleCorkageFeeChange}
                                placeholder="병당 금액을 숫자로만 입력해주세요"
                                keyboardType="numeric"
                                placeholderTextColor="#888"
                            />
                        </View>
                    )}
                    
                    {/* 콜키지 관련 메모 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                styles.input, 
                                { height: Math.max(40, memoHeight) }
                            ]}
                            value={corkageMemo}
                            onChangeText={setCorkageMemo}
                            placeholder="콜키지 관련 메모"
                            multiline={true}
                            onContentSizeChange={(e) => 
                                setMemoHeight(e.nativeEvent.contentSize.height)
                            }
                            placeholderTextColor="#888"
                        />
                    </View>
                </View>
                
                {/* 위치 정보 섹션 */}
                <SectionHeader title="위치 정보" />
                <View style={styles.sectionContent}>
                    {/* 위치 정보 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={(text) => {
                                setLocation(text);
                                // 주소가 변경되면 검증 상태 초기화
                                if (isAddressVerified) {
                                    setIsAddressVerified(false);
                                }
                            }}
                            placeholder="주소"
                            placeholderTextColor="#888"
                        />
                    </View>
                    
                    {/* 상세 주소 입력 필드 - 주소 검증이 성공했을 때만 표시 */}
                    {isAddressVerified && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={detailAddress}
                                onChangeText={setDetailAddress}
                                placeholder="상세 주소"
                                placeholderTextColor="#888"
                            />
                            {detailAddress.trim() !== '' && (
                                <Text style={styles.fullAddressText}>
                                    {location} {detailAddress}
                                </Text>
                            )}
                        </View>
                    )}
                    
                    {/* 주소 검색 버튼 */}
                    <TouchableOpacity 
                        style={[
                            styles.addressSearchButton, 
                            !location.trim() && styles.addressSearchButtonDisabled
                        ]} 
                        disabled={!location.trim()}
                        onPress={() => {
                            console.log('주소 검색 버튼 클릭, 현재 location 값:', location);
                            tryGeocoding(location);
                        }}>
                        <Text style={[
                            styles.addressSearchButtonText,
                            !location.trim() && styles.addressSearchButtonTextDisabled
                        ]}>주소 검색</Text>
                    </TouchableOpacity>
                </View>
                
                {/* 운영 정보 섹션 */}
                <SectionHeader title="운영 정보" />
                <View style={styles.sectionContent}>
                    {/* 전화번호 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="전화번호"
                            keyboardType="phone-pad"
                            placeholderTextColor="#888"
                        />
                    </View>
                    
                    {/* 영업 시간 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.timeLabel}>영업 시간</Text>
                        <View style={styles.timePickerContainer}>
                            <TouchableOpacity 
                                style={styles.timeButton}
                                onPress={() => showTimePickerModal(true)}
                            >
                                <Text style={styles.timeButtonText}>{openTime}</Text>
                            </TouchableOpacity>
                            <Text style={styles.timeSeparator}>~</Text>
                            <TouchableOpacity 
                                style={styles.timeButton}
                                onPress={() => showTimePickerModal(false)}
                            >
                                <Text style={styles.timeButtonText}>{closeTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* 휴무일 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>휴무일</Text>
                        <TouchableOpacity 
                            style={styles.daySelector}
                            onPress={() => setShowClosedDaysModal(true)}
                        >
                            <Text style={closedDays ? styles.daySelectedText : styles.placeholderText}>
                                {closedDays || '휴무일 선택'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* 브레이크타임 스위치 */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>브레이크타임</Text>
                        <Switch
                            value={isBreakTimeEnabled}
                            onValueChange={setIsBreakTimeEnabled}
                            trackColor={{ false: "#d3d3d3", true: "#81b0ff" }}
                            thumbColor={isBreakTimeEnabled ? "#ffffff" : "#f4f3f4"}
                        />
                    </View>
                    
                    {/* 브레이크타임 입력 - 스위치가 켜졌을 때만 표시 */}
                    {isBreakTimeEnabled && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.timeLabel}>브레이크타임</Text>
                            <View style={styles.timePickerContainer}>
                                <TouchableOpacity 
                                    style={styles.timeButton}
                                    onPress={() => showBreakTimePickerModal(true)}
                                >
                                    <Text style={styles.timeButtonText}>{breakTimeStart}</Text>
                                </TouchableOpacity>
                                <Text style={styles.timeSeparator}>~</Text>
                                <TouchableOpacity 
                                    style={styles.timeButton}
                                    onPress={() => showBreakTimePickerModal(false)}
                                >
                                    <Text style={styles.timeButtonText}>{breakTimeEnd}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
                
                {/* 음료 카테고리 섹션 */}
                <SectionHeader title="음료 카테고리" />
                <View style={styles.sectionContent}>
                    <Text style={styles.inputLabel}>취급 음료 (최소 1개 이상)</Text>
                    <TouchableOpacity 
                        style={styles.categorySelector}
                        onPress={() => setShowDrinkCategoryModal(true)}
                    >
                        <Text style={selectedDrinkCategories.length > 0 ? styles.categorySelectedText : styles.placeholderText}>
                            {selectedDrinkCategories.length > 0 
                                ? selectedDrinkCategories.map(cat => 
                                    DRINK_CATEGORIES.find(c => c.id === cat)?.title).join(', ') 
                                : '음료 카테고리 선택'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#888" />
                    </TouchableOpacity>
                </View>
                
                {/* 저장 버튼 */}
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        !isSaveButtonEnabled && styles.saveButtonDisabled
                    ]} 
                    onPress={handleSave}
                    disabled={isLoading || !isSaveButtonEnabled}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>저장하기</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
            
            {/* 시간 선택기 모달 (실제 구현에서는 DateTimePicker 사용) */}
            {showTimePicker && (
                Platform.OS === 'ios' ? (
                    <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
                        <View style={styles.timePickerWrapper}>
                            <TouchableWithoutFeedback>
                                <View style={styles.timePickerContent}>
                                    <View style={styles.timePickerHeader}>
                                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                            <Text style={styles.timePickerCancelText}>취소</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleConfirmTime}>
                                            <Text style={styles.timePickerConfirmText}>확인</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="time"
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={handleTimeChange}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                ) : (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleTimeChange}
                    />
                )
            )}

            {/* 카테고리 선택 모달 */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>카테고리 선택</Text>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.categoryOption}
                                        onPress={() => selectCategory(cat.title, cat.id)}
                                    >
                                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                        <Text style={styles.categoryOptionText}>{cat.title}</Text>
                                    </TouchableOpacity>
                                ))}
                                
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setShowCategoryModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>닫기</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* 휴무일 선택 모달 */}
            <Modal
                visible={showClosedDaysModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowClosedDaysModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowClosedDaysModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>휴무일 선택</Text>
                                <Text style={styles.modalSubtitle}>복수 선택 가능합니다</Text>
                                
                                {weekdays.map((day) => (
                                    <TouchableOpacity
                                        key={day.id}
                                        style={[
                                            styles.dayOption,
                                            selectedClosedDays.includes(day.id) && styles.dayOptionSelected
                                        ]}
                                        onPress={() => toggleClosedDay(day.id)}
                                    >
                                        <View style={styles.dayOptionContent}>
                                            <Text style={[
                                                styles.dayOptionText,
                                                selectedClosedDays.includes(day.id) && styles.dayOptionTextSelected
                                            ]}>
                                                {day.title}
                                            </Text>
                                            {selectedClosedDays.includes(day.id) && (
                                                <Ionicons name="checkmark" size={20} color="#4A6FE7" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setShowClosedDaysModal(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>취소</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.confirmButton]}
                                        onPress={confirmClosedDays}
                                    >
                                        <Text style={styles.confirmButtonText}>확인</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* 음료 카테고리 선택 모달 */}
            <Modal
                visible={showDrinkCategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDrinkCategoryModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowDrinkCategoryModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>음료 카테고리 선택</Text>
                                <Text style={styles.modalSubtitle}>하나 이상 선택해주세요</Text>
                                
                                {DRINK_CATEGORIES.map((drink) => (
                                    <TouchableOpacity
                                        key={drink.id}
                                        style={[
                                            styles.dayOption,
                                            selectedDrinkCategories.includes(drink.id) && styles.dayOptionSelected
                                        ]}
                                        onPress={() => toggleDrinkCategory(drink.id)}
                                    >
                                        <View style={styles.dayOptionContent}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={{fontSize: 20, marginRight: 10}}>{drink.emoji}</Text>
                                                <Text style={[
                                                    styles.dayOptionText,
                                                    selectedDrinkCategories.includes(drink.id) && styles.dayOptionTextSelected
                                                ]}>
                                                    {drink.title}
                                                </Text>
                                            </View>
                                            {selectedDrinkCategories.includes(drink.id) && (
                                                <Ionicons name="checkmark" size={20} color="#4A6FE7" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setShowDrinkCategoryModal(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>취소</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[
                                            styles.modalButton, 
                                            styles.confirmButton,
                                            selectedDrinkCategories.length === 0 && {backgroundColor: '#cccccc'}
                                        ]}
                                        onPress={confirmDrinkCategories}
                                        disabled={selectedDrinkCategories.length === 0}
                                    >
                                        <Text style={styles.confirmButtonText}>확인</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* 브레이크타임 선택기 모달 */}
            {showBreakTimePicker && (
                Platform.OS === 'ios' ? (
                    <TouchableWithoutFeedback onPress={() => setShowBreakTimePicker(false)}>
                        <View style={styles.timePickerWrapper}>
                            <TouchableWithoutFeedback>
                                <View style={styles.timePickerContent}>
                                    <View style={styles.timePickerHeader}>
                                        <TouchableOpacity onPress={() => setShowBreakTimePicker(false)}>
                                            <Text style={styles.timePickerCancelText}>취소</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleConfirmBreakTime}>
                                            <Text style={styles.timePickerConfirmText}>확인</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        testID="breakTimePicker"
                                        value={breakTimeDate}
                                        mode="time"
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={handleBreakTimeChange}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                ) : (
                    <DateTimePicker
                        testID="breakTimePicker"
                        value={breakTimeDate}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleBreakTimeChange}
                    />
                )
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    titleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    // 섹션 헤더 스타일
    sectionHeader: {
        marginTop: 20,
        marginBottom: 10,
        paddingBottom: 8,
    },
    sectionHeaderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#777',
    },
    sectionContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageUploadContainer: {
        marginBottom: 20,
    },
    imageSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        marginLeft: 2,
    },
    imageGalleryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 5,
    },
    thumbnailWrapper: {
        position: 'relative',
        margin: 4,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    removeThumbnailButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ff4d4d',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeThumbnailButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addMoreButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
        backgroundColor: '#f7f7f7',
    },
    addMoreButtonText: {
        fontSize: 30,
        color: '#888',
        fontWeight: '300',
    },
    addMoreButtonSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    inputContainer: {
        marginBottom: 15,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
    },
    saveButton: {
        backgroundColor: '#4A6FE7',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 30,
    },
    saveButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    addressSearchButton: {
        backgroundColor: '#4A6FE7',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    addressSearchButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    addressSearchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    addressSearchButtonTextDisabled: {
        color: '#999999',
    },
    timeLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 8,
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    timeButton: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 5,
        flex: 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    timeButtonText: {
        fontSize: 16,
        color: '#444',
    },
    timeSeparator: {
        flex: 0.5,
        textAlign: 'center',
        fontSize: 18,
        color: '#777',
    },
    // 모달 스타일
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'stretch',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#4A6FE7',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#444',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    timePickerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timePickerContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    timePickerCancelText: {
        fontSize: 16,
        color: '#4A6FE7',
    },
    timePickerConfirmText: {
        fontSize: 16,
        color: '#4A6FE7',
    },
    detailAddressContainer: {
        marginTop: 10,
    },
    fullAddressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        marginLeft: 4,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    // 카테고리 선택기 스타일
    categorySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        backgroundColor: '#fff',
    },
    placeholderText: {
        color: '#888',
        fontSize: 16,
    },
    categorySelectedText: {
        color: '#000',
        fontSize: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryEmoji: {
        fontSize: 20,
        marginRight: 10,
    },
    categoryOptionText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#4A6FE7',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    inputHelpText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        marginLeft: 4,
    },
    daySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        backgroundColor: '#fff',
    },
    daySelectedText: {
        color: '#000',
        fontSize: 16,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#777',
        marginBottom: 15,
    },
    dayOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dayOptionSelected: {
        backgroundColor: '#f0f8ff',
    },
    dayOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    dayOptionText: {
        fontSize: 16,
        color: '#444',
    },
    dayOptionTextSelected: {
        color: '#4A6FE7',
        fontWeight: '500',
    },
    loginRequiredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    lockIcon: {
        marginBottom: 20,
    },
    loginRequiredTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    loginRequiredText: {
        fontSize: 14,
        color: '#777',
        marginBottom: 20,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RegisterScreen;
