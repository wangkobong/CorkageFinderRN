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
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import DateTimePicker from '@react-native-community/datetimepicker';

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <TitleText>레스토랑 등록</TitleText>
                
                {/* 기본 정보 섹션 */}
                <SectionHeader title="기본 정보" />
                <View style={styles.sectionContent}>
                    {/* 이미지 업로드 영역 */}
                    <View style={styles.imageUploadContainer}>
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>+</Text>
                            <Text style={styles.imageText}>이미지 추가</Text>
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
                    
                    {/* 카테고리 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={category}
                            onChangeText={setCategory}
                            placeholder="카테고리"
                            placeholderTextColor="#888"
                        />
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
                            onChangeText={setLocation}
                            placeholder="주소"
                            placeholderTextColor="#888"
                        />
                    </View>
                    
                    {/* 주소 검색 버튼 */}
                    <TouchableOpacity style={styles.addressSearchButton}>
                        <Text style={styles.addressSearchButtonText}>주소 검색</Text>
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
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>저장하기</Text>
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
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        fontSize: 40,
        color: '#999',
    },
    imageText: {
        marginTop: 5,
        color: '#666',
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
    addressSearchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
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
});

export default RegisterScreen;
