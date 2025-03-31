// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/app/_layout'; // db를 가져오는 경로 확인 후 수정하세요

// export const getApprovedRestaurants = async () => {
//   try {
//     const restaurantsSnapshot = await getDocs(collection(db, "approved"));
//     return restaurantsSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//   } catch (error) {
//     console.error("Firestore 데이터 가져오기 오류:", error);
//     return [];
//   }
// };
