export interface GeocodingResponse {
  documents: Document[];
  meta: Meta;
}

export interface Document {
  address: Address;
  address_name: string;
  address_type: string;
  road_address?: RoadAddress;
  x: string;
  y: string;
}

export interface Address {
  address_name: string;
  b_code: string;
  h_code: string;
  main_address_no: string;
  mountain_yn: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_h_name: string;
  region_3depth_name: string;
  sub_address_no: string;
  x: string;
  y: string;
}

export interface RoadAddress {
  address_name: string;
  building_name: string;
  main_building_no: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  road_name: string;
  sub_building_no: string;
  underground_yn: string;
  x: string;
  y: string;
  zone_no: string;
}

export interface Meta {
  is_end: boolean;
  pageable_count: number;
  total_count: number;
}

// 편의를 위한 유틸리티 함수
export const getCoordinates = (document: Document): { latitude: number; longitude: number } => {
  return {
    latitude: parseFloat(document.y) || 0,
    longitude: parseFloat(document.x) || 0
  };
};
