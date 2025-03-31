import { GeocodingResponse } from '../../api/models/geocoding';

/**
 * KakaoApiManager.ts
 * 카카오 API 서비스를 관리하는 클래스
 */

// API 호출 중 발생할 수 있는 에러 타입
export class KakaoAPIError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'KakaoAPIError';
    this.statusCode = statusCode;
  }
}

/**
 * 카카오 API 매니저 클래스
 */
export class KakaoApiManager {
  
  /**
   * 주소 검색 API 호출
   * @param address 검색할 주소
   * @returns 지오코딩 응답
   */
  async searchAddress(address: string): Promise<GeocodingResponse> {
    const apiKey = process.env.EXPO_PUBLIC_API_KEY;

    
    if (!apiKey) {
      console.error('API 키가 없습니다');
      throw new KakaoAPIError('API 키가 설정되지 않았습니다');
    }
    
    if (!address.trim()) {
      console.error('주소가 비어있습니다');
      throw new KakaoAPIError('검색할 주소가 입력되지 않았습니다');
    }
    
    try {
      const baseURL = 'https://dapi.kakao.com/v2/local/search/address';
      const encodedAddress = encodeURIComponent(address);
      const url = `${baseURL}?query=${encodedAddress}`;
      
      console.log('API 요청 URL:', url);
      
      const headers = {
        'Authorization': `KakaoAK ${apiKey}`,
        'Content-Type': 'application/json',
      };
      console.log('API 요청 Headers:', JSON.stringify(headers));
      console.log('API 요청 시작');
      
      console.log('fetch 함수 호출 직전');
      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers,
        });
        console.log('fetch 응답 수신 성공');
      } catch (fetchError) {
        console.error('fetch 호출 중 오류 발생:', fetchError);
        throw fetchError;
      }
      
      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 헤더:', JSON.stringify([...response.headers.entries()]));
      
      if (!response.ok) {
        console.error('API 응답 에러:', response.status, response.statusText);
        // 응답 본문 읽기 시도
        try {
          const errorBody = await response.text();
          console.error('API 오류 응답 본문:', errorBody);
        } catch (e) {
          console.error('응답 본문 읽기 실패:', e);
        }
        throw new KakaoAPIError(
          `API 호출 실패: ${response.statusText}`,
          response.status
        );
      }
      
      console.log('응답 본문 파싱 시작');
      let data;
      try {
        data = await response.json();
        console.log('응답 본문 파싱 완료');
      } catch (parseError) {
        console.error('응답 파싱 중 오류:', parseError);
        throw parseError;
      }
      
      console.log('API 응답 데이터 파싱 완료');
      return data;
    } catch (error) {
      console.error('searchAddress 에러 발생:', error);
      
      if (error instanceof KakaoAPIError) {
        throw error;
      }
      
      console.error('카카오 지오코딩 API 호출 중 오류:', error);
      throw new KakaoAPIError('주소 검색 중 오류가 발생했습니다');
    }
  }
  
  /**
   * 좌표를 통한 주소 검색 (역지오코딩)
   * @param x 경도
   * @param y 위도
   * @returns 역지오코딩 응답
   */
  async searchCoordToAddress(x: string, y: string): Promise<any> {
    const apiKey = process.env.EXPO_PUBLIC_KAKAO_API_KEY;
    
    if (!apiKey) {
      throw new KakaoAPIError('API 키가 설정되지 않았습니다');
    }
    
    try {
      const baseURL = 'https://dapi.kakao.com/v2/local/geo/coord2address';
      const url = `${baseURL}?x=${x}&y=${y}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new KakaoAPIError(
          `API 호출 실패: ${response.statusText}`,
          response.status
        );
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof KakaoAPIError) {
        throw error;
      }
      
      console.error('카카오 역지오코딩 API 호출 중 오류:', error);
      throw new KakaoAPIError('좌표를 주소로 변환하는 중 오류가 발생했습니다');
    }
  }
}

// 클래스를 직접 내보냅니다
export default KakaoApiManager; 