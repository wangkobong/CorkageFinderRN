import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
// 서비스 계정 키 로드 및 Admin SDK 초기화
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
let serviceAccount;

try {
  const serviceAccountJson = fs.readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(serviceAccountJson);
  console.log("서비스 계정 키 로드 성공");
} catch (error) {
  console.error("서비스 계정 키 로드 오류:", error);
  throw new Error("서비스 계정 키를 로드할 수 없습니다.");
}

// Admin SDK 초기화 (한 번만 실행)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 테스트 연결 함수
export const connectTest = functions.https.onCall(async (data, _context) => {
  console.log("connectTest 함수 호출됨:", data);

  try {
    // 초기화된 앱은 이미 모듈 수준에서 설정됨
    console.log("앱 인스턴스 ID:", admin.app().name);

    // 명시적으로 Promise로 감싸서 반환
    const response = {
      success: true,
      message: "Firebase Functions 연결 성공!",
      receivedData: data || "데이터 없음",
      timestamp: new Date().toISOString(),
    };
    try {
      JSON.stringify(response);
    } catch (e) {
      console.error("직렬화 오류:", e);
    }
    // return response;
  } catch (error) {
    console.error("connectTest 오류:", error);
    throw new functions.https.HttpsError(
      "internal",
      "connectTest 함수 처리 중 오류가 발생했습니다."
    );
  }
});


// 커스텀 로그인 함수 (카카오/네이버)
// 커스텀 로그인 함수 (카카오/네이버)
export const customLogin = functions.https.onCall(async (request, _context) => {
  const data = request.data;
  console.log("customLogin 함수 호출됨:", data);

  try {
    // 1. 입력 타입 정의 및 검증
    // interface LoginData {
    //   platform: string;
    //   accessToken: string;
    // }

    // 타입 가드로 데이터 검증
    // const isValidLoginData = (input: any): input is LoginData => {
    //   return (
    //     input &&
    //     typeof input === "object" &&
    //     typeof input.platform === "string" &&
    //     typeof input.accessToken === "string"
    //   );
    // };

    // if (!isValidLoginData(data)) {
    //   throw new functions.https.HttpsError(
    //     "invalid-argument",
    //     "플랫폼과 액세스 토큰이 올바른 형식이 아닙니다."
    //   );
    // }

    // 2. 구조 분해 할당 (안전하게)
    const platform = data.platform as string;
    const accessToken = data.accessToken as string;

    let userInfo: { uid: string; email?: string | null; displayName: string };
    let firebaseUid: string;

    // 3. 플랫폼별 토큰 검증
    if (platform === "kakao") {
      console.log("카카오 로그인 시도");
      console.log("카카오 액세스 토큰:", accessToken);
      const kakaoResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      const kakaoUser = kakaoResponse.data;
      console.log("카카오 사용자 정보:", kakaoUser);

      const kakaoId = kakaoUser.id.toString();
      userInfo = {
        uid: `kakao:${kakaoId}`,
        email: kakaoUser.kakao_account?.email || null,
        displayName: kakaoUser.properties?.nickname || `KakaoUser_${kakaoId}`,
      };
      firebaseUid = userInfo.uid;
    } else if (platform === "naver") {
      const naverResponse = await axios.get("https://openapi.naver.com/v1/nid/me", {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      const naverUser = naverResponse.data.response;
      console.log("네이버 사용자 정보:", naverUser);

      const naverId = naverUser.id;
      userInfo = {
        uid: `naver:${naverId}`,
        email: naverUser.email || null,
        displayName: naverUser.nickname || `NaverUser_${naverId}`,
      };
      firebaseUid = userInfo.uid;
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `지원되지 않는 플랫폼입니다: ${platform}`
      );
    }

    // 4. Firebase 사용자 관리
    try {
      await admin.auth().updateUser(firebaseUid, {
        email: userInfo.email || undefined,
        displayName: userInfo.displayName,
      });
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        await admin.auth().createUser({
          uid: firebaseUid,
          email: userInfo.email || undefined,
          displayName: userInfo.displayName,
        });
      } else {
        throw error;
      }
    }

    // 5. Firebase 커스텀 토큰 생성
    const firebaseToken = await admin.auth().createCustomToken(firebaseUid);
    console.log("Firebase 커스텀 토큰 생성 성공");

    // 6. 반환
    return {
      firebaseToken,
      success: true,
      message: `${platform} 로그인 성공`,
    };
  } catch (error: any) {
    console.error("customLogin 오류:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "로그인 처리 중 오류가 발생했습니다."
    );
  }
});
