import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/app/_layout';
import { useLocalSearchParams, router } from 'expo-router';
import { RestaurantCard } from '../../../api/models/restaurant';
import { TitleText } from '../../components/title_text';

// 상세 정보 타입
interface PendingRestaurantDetail extends RestaurantCard {
  submittedBy?: string;
  submittedAt?: string;
  notes?: string;
}

const PendingRestaurantDetailScreen = () => {
  const params = useLocalSearchParams();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<PendingRestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        if (!restaurantId) {
          setError('식당 ID가 없습니다.');
          setLoading(false);
          return;
        }

        const restaurantDoc = await getDoc(doc(db, "pending", restaurantId));
        
        if (restaurantDoc.exists()) {
          const restaurantData = {
            id: restaurantDoc.id,
            ...restaurantDoc.data()
          } as PendingRestaurantDetail;
          
          setRestaurant(restaurantData);
          
          if (restaurantData.imageURLs && restaurantData.imageURLs.length > 0) {
            console.log("이미지 URL 개수:", restaurantData.imageURLs.length);
            restaurantData.imageURLs.forEach((url, index) => {
              console.log(`이미지 URL ${index + 1}:`, url);
            });
          } else {
            console.log("이미지 URL이 없거나 빈 배열입니다.");
          }
        } else {
          setError('해당 식당 정보를 찾을 수 없습니다.');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("식당 상세 정보 가져오기 오류:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRestaurantDetail();
  }, [restaurantId]);

  const handleApprove = async () => {
    Alert.alert(
      "식당 승인",
      "이 식당을 승인하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "승인",
          onPress: async () => {
            try {
              if (!restaurant) {
                Alert.alert("오류", "식당 정보가 없습니다.");
                return;
              }

              // 로딩 표시
              setLoading(true);
              
              // 1. 현재 데이터를 approved 컬렉션으로 복사
              const { id, ...restaurantDataWithoutId } = restaurant;
              
              // approved 컬렉션에 동일한 ID로 저장
              await setDoc(doc(db, "approved", id), {
                ...restaurantDataWithoutId,
                approvedAt: new Date().toISOString(), // 승인 시간 추가
                status: 'approved' // 상태 필드 추가
              });
              
              console.log("Approved 컬렉션에 데이터 복사 완료:", id);
              
              // 2. pending에서 원본 데이터 삭제
              await deleteDoc(doc(db, "pending", id));
              console.log("Pending 컬렉션에서 데이터 삭제 완료:", id);
              
              setLoading(false);
              Alert.alert("성공", "식당이 성공적으로 승인되었습니다.");
              router.back(); // 이전 화면으로 돌아가기
            } catch (error: any) {
              console.error("승인 과정 오류:", error);
              setLoading(false);
              Alert.alert("오류", `승인 과정에서 오류가 발생했습니다: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      "식당 거부",
      "이 식당을 거부하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "거부",
          onPress: async () => {
            try {
              if (!restaurant) {
                Alert.alert("오류", "식당 정보가 없습니다.");
                return;
              }
              
              // 로딩 표시
              setLoading(true);
              
              // 1. 현재 데이터를 rejected 컬렉션으로 복사
              const { id, ...restaurantDataWithoutId } = restaurant;
              
              // rejected 컬렉션에 동일한 ID로 저장
              await setDoc(doc(db, "rejected", id), {
                ...restaurantDataWithoutId,
                rejectedAt: new Date().toISOString(), // 거부 시간 추가
                status: 'rejected' // 상태 필드 추가
              });
              
              console.log("Rejected 컬렉션에 데이터 복사 완료:", id);
              
              // 2. pending에서 원본 데이터 삭제
              await deleteDoc(doc(db, "pending", id));
              console.log("Pending 컬렉션에서 데이터 삭제 완료:", id);
              
              setLoading(false);
              Alert.alert("성공", "식당이 거부되었습니다.");
              router.back(); // 이전 화면으로 돌아가기
            } catch (error: any) {
              console.error("거부 과정 오류:", error);
              setLoading(false);
              Alert.alert("오류", `거부 과정에서 오류가 발생했습니다: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({...prev, [index]: true}));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>오류: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>식당 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  // 유효한 이미지가 있는지 확인
  const hasValidImages = restaurant.imageURLs && 
                        restaurant.imageURLs.length > 0 && 
                        restaurant.imageURLs.some((_, index) => !imageErrors[index]);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TitleText>대기 중인 식당 상세 정보</TitleText>
        
        {/* 이미지 갤러리 */}
        <View style={styles.imageGallery}>
          <Text style={styles.sectionTitle}>이미지</Text>
          {hasValidImages ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {restaurant.imageURLs.map((imageUrl, index) => {
                console.log(`이미지 ${index} 렌더링 시도:`, imageUrl, `에러 상태:`, imageErrors[index]);
                return !imageErrors[index] && (
                  <View key={index} style={styles.imageContainer}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.restaurantImage}
                      resizeMode="cover"
                      onError={() => {
                        console.log(`이미지 ${index} 로드 오류:`, imageUrl);
                        handleImageError(index);
                      }}
                      onLoad={() => console.log(`이미지 ${index} 로드 성공:`, imageUrl)}
                    />
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>이미지가 없습니다</Text>
            </View>
          )}
        </View>
        
        {/* 기본 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{restaurant.name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>카테고리</Text>
            <Text style={styles.value}>{restaurant.category}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.value}>{restaurant.address}</Text>
          </View>

          {restaurant.addressDetail && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>상세 주소</Text>
              <Text style={styles.value}>{restaurant.addressDetail}</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.label}>지역</Text>
            <Text style={styles.value}>{restaurant.sido} {restaurant.sigungu}</Text>
          </View>

          {restaurant.phoneNumber && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>전화번호</Text>
              <Text style={styles.value}>{restaurant.phoneNumber}</Text>
            </View>
          )}
        </View>

        {/* 콜키지 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>콜키지 정보</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.label}>콜키지 무료 여부</Text>
            <Text style={styles.value}>{restaurant.isCorkageFree ? '무료' : '유료'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>콜키지 비용</Text>
            <Text style={styles.value}>{restaurant.corkageFee}</Text>
          </View>

          {restaurant.corkageNote && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>콜키지 관련 메모</Text>
              <Text style={styles.value}>{restaurant.corkageNote}</Text>
            </View>
          )}
        </View>

        {/* 영업 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영업 정보</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.label}>영업 시간</Text>
            <Text style={styles.value}>{restaurant.businessHours}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>휴무일</Text>
            <Text style={styles.value}>{restaurant.closedDays}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>브레이크타임 여부</Text>
            <Text style={styles.value}>{restaurant.isBreaktime ? '있음' : '없음'}</Text>
          </View>

          {restaurant.isBreaktime && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>브레이크타임</Text>
              <Text style={styles.value}>{restaurant.breaktime}</Text>
            </View>
          )}
        </View>

        {/* 제출 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제출 정보</Text>
          
          {restaurant.submittedBy && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>제출자</Text>
              <Text style={styles.value}>{restaurant.submittedBy}</Text>
            </View>
          )}

          {restaurant.submittedAt && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>제출 시간</Text>
              <Text style={styles.value}>{restaurant.submittedAt}</Text>
            </View>
          )}

          {restaurant.notes && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>메모</Text>
              <Text style={styles.value}>{restaurant.notes}</Text>
            </View>
          )}
        </View>

        {/* 승인/거부 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
            <Text style={styles.buttonText}>승인</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.buttonText}>거부</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  imageGallery: {
    marginTop: 16,
    marginBottom: 20,
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  restaurantImage: {
    width: 200,
    height: 150,
  },
  noImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default PendingRestaurantDetailScreen;
