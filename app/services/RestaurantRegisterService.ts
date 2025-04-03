import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { firebaseConfig } from '../../firebaseConfig';
import { RestaurantCard } from '../../api/models/restaurant';
// Firebase 초기화 상태를 추적하는 변수
let isFirebaseInitialized = false;

// RestaurantRegisterService 클래스 구현
export class RestaurantRegisterService {

  
  // 이미지 업로드 함수
  static async uploadImages(images: { uri: string }[]): Promise<string[]> {
    try {
      const storage = getStorage();
      const uploadedURLs: string[] = [];
      const imageRefs: { [key: string]: any } = {};
      
      // 날짜 형식 지정하여 폴더명 생성
      const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const dateString = dateFormatter.format(new Date()).replace(/\D/g, '');
      
      // 이미지 순차적으로 업로드
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const response = await fetch(image.uri);
        const blob = await response.blob();
        
        // 이미지 저장 경로와 파일명 생성
        const path = `restaurants/${dateString}/${Date.now()}_${i}.jpg`;
        const imageRef = ref(storage, path);
        
        // 메타데이터 설정
        const metadata = {
          contentType: 'image/jpeg',
        };
        
        // 이미지 업로드 
        await uploadBytes(imageRef, blob, metadata);
        const downloadURL = await getDownloadURL(imageRef);
        
        // URL과 참조 저장 (나중에 오류 발생 시 삭제를 위해)
        uploadedURLs.push(downloadURL);
        imageRefs[downloadURL] = imageRef;
      }
      
      return uploadedURLs;
      
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
      throw error;
    }
  }
  
  static async addRestaurant(data: RestaurantCard): Promise<string> {
    try {
        const db = getFirestore();
        
        // restaurantID를 문서 ID로 사용
        const docRef = doc(db, "pending", data.restaurantID);

        // Firestore에 데이터 추가
        await setDoc(docRef, {
            imageURLs: data.imageURLs,
            name: data.name,
            category: data.category,
            isCorkageFree: data.isCorkageFree,
            corkageFee: data.corkageFee,
            sido: data.sido,
            sigungu: data.sigungu,
            phoneNumber: data.phoneNumber,
            address: data.address,
            addressDetail: data.addressDetail,
            businessHours: data.businessHours,
            closedDays: data.closedDays,
            corkageNote: data.corkageNote,
            latitude: data.latitude || 0.0,
            longitude: data.longitude || 0.0,
            isBreaktime: data.isBreaktime,
            breaktime: data.breaktime,
            drinkCategories: data.drinkCategories
        });
        
        console.log("Restaurant added with ID:", data.restaurantID);
        return data.restaurantID;
        
    } catch (error) {
        console.error('레스토랑 추가 중 오류 발생:', error);
        throw error;
    }
  }

  // 레스토랑 승인 메서드
  static async approveRestaurant(restaurantID: string): Promise<void> {
    try {
      const db = getFirestore();
      
      // 1. pending 컬렉션에서 데이터 가져오기
      const pendingDocRef = doc(db, "pending", restaurantID);
      const pendingDocSnap = await getDoc(pendingDocRef);
      
      if (!pendingDocSnap.exists()) {
        throw new Error(`대기 중인 식당 ID ${restaurantID}를 찾을 수 없습니다.`);
      }
      
      const restaurantData = pendingDocSnap.data();
      
      // 2. approved 컬렉션에 데이터 추가
      const approvedDocRef = doc(db, "approved", restaurantID);
      await setDoc(approvedDocRef, {
        ...restaurantData,
        approvedAt: new Date().toISOString(), // 승인 시간 추가
        status: 'approved' // 상태 표시
      });
      
      console.log("Restaurant approved with ID:", restaurantID);
      
      // 3. pending 컬렉션에서 문서 삭제
      await deleteDoc(pendingDocRef);
      console.log("Restaurant removed from pending collection:", restaurantID);
      
    } catch (error) {
      console.error('레스토랑 승인 중 오류 발생:', error);
      throw error;
    }
  }
  
  // 레스토랑 거절 메서드
  static async rejectRestaurant(restaurantID: string): Promise<void> {
    try {
      const db = getFirestore();
      
      // 1. pending 컬렉션에서 데이터 가져오기
      const pendingDocRef = doc(db, "pending", restaurantID);
      const pendingDocSnap = await getDoc(pendingDocRef);
      
      if (!pendingDocSnap.exists()) {
        throw new Error(`대기 중인 식당 ID ${restaurantID}를 찾을 수 없습니다.`);
      }
      
      const restaurantData = pendingDocSnap.data();
      
      // 2. rejected 컬렉션에 데이터 추가
      const rejectedDocRef = doc(db, "rejected", restaurantID);
      await setDoc(rejectedDocRef, {
        ...restaurantData,
        rejectedAt: new Date().toISOString(), // 거절 시간 추가
        status: 'rejected' // 상태 표시
      });
      
      console.log("Restaurant rejected with ID:", restaurantID);
      
      // 3. pending 컬렉션에서 문서 삭제
      await deleteDoc(pendingDocRef);
      console.log("Restaurant removed from pending collection:", restaurantID);
      
    } catch (error) {
      console.error('레스토랑 거절 중 오류 발생:', error);
      throw error;
    }
  }
} 