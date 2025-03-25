import * as React from 'react';
import { useState } from 'react';
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

// 섹션 헤더 컴포넌트
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const RegisterScreen = () => {
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

    // 카테고리 선택 함수
    const selectCategory = (categoryTitle: string, categoryId: HomeRestaurantCategory) => {
        setCategory(categoryTitle);
        setSelectedCategoryId(categoryId);
        setShowCategoryModal(false);
    };

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

    // 피커 확인 버튼 처리
    const handleConfirmTime = () => {
        applySelectedTime(date);
        setShowTimePicker(false);
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

    // 저장 버튼 클릭 시 호출되는 함수 (수정)
    const handleSave = async () => {
        try {
            // 필수 입력값 검증
            if (!restaurantName || !location || !isAddressVerified || !category) {
                Alert.alert('입력 오류', '필수 정보를 모두 입력해주세요.');
                return;
            }
            
            // 로딩 상태 시작
            setIsLoading(true);
            
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
            
            // 4. 레스토랑 데이터 객체 생성 (수정)
            const categoryEnum = getCategoryEnum();
            const restaurantData = {
                imageURLs,
                name: restaurantName,
                category: categoryEnum,
                isCorkageFree,
                corkageFee: isCorkageFree ? '' : corkageFee,
                sido,
                sigungu,
                phoneNumber,
                address: location,
                addressDetail: detailAddress,
                businessHours: businessHoursStr,
                closedDays,
                corkageNote: corkageMemo,
                latitude,
                longitude,
                isBreaktime: isBreakTimeEnabled,
                breaktime: isBreakTimeEnabled ? breakTime : ''
            };
            
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
                        onPress: () => {
                            // 폼 초기화
                            setRestaurantName('');
                            setCategory('');
                            setIsCorkageFree(false);
                            setCorkageFee('');
                            setCorkageMemo('');
                            setLocation('');
                            setDetailAddress('');
                            setIsAddressVerified(false);
                            setPhoneNumber('');
                            setClosedDays('');
                            setBreakTime('');
                            setIsBreakTimeEnabled(false);
                            setImages([]);
                            setGeocodingResponse(null);
                        } 
                    }
                ]
            );
            
        } catch (error) {
            setIsLoading(false);
            console.error('레스토랑 등록 실패:', error);
            Alert.alert('오류', '레스토랑 등록 중 문제가 발생했습니다.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <TitleText>등록 요청</TitleText>
                
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
                            <TextInput
                                style={styles.input}
                                value={corkageFee}
                                onChangeText={setCorkageFee}
                                placeholder="콜키지 비용"
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
                        <TextInput
                            style={styles.input}
                            value={closedDays}
                            onChangeText={setClosedDays}
                            placeholder="휴무일"
                            placeholderTextColor="#888"
                        />
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
                            <TextInput
                                style={styles.input}
                                value={breakTime}
                                onChangeText={setBreakTime}
                                placeholder="브레이크타임"
                                placeholderTextColor="#888"
                            />
                        </View>
                    )}
                </View>
                
                {/* 저장 버튼 */}
                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSave}
                    disabled={isLoading}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
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
    modalButton: {
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#4A6FE7',
    },
    modalButtonText: {
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
});

export default RegisterScreen;
