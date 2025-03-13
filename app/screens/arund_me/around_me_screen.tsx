import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import { WebView } from 'react-native-webview';
import { KAKAO_JS_KEY } from '@env';
import { useRestaurantStore } from '../../store/_restaurantStore';
import SectionHeader from '@/app/components/section_header';

const AroundMeScreen = () => {
  const [location, setLocation] = useState({
    latitude: 37.566826,  // 서울 시청 기본값
    longitude: 126.9786567
  });

  const restaurants = useRestaurantStore((state: any) => state.restaurants);
  
  useEffect(() => {
    console.log("레스토랑 데이터 개수:", restaurants?.length || 0);
  }, [restaurants]);

  // 카카오맵 HTML 코드
  const kakaoMapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services"></script>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(${location.latitude}, ${location.longitude}),
          level: 10
        };
        var map = new kakao.maps.Map(container, options);
        
        // 현재 위치 마커
        var markerPosition = new kakao.maps.LatLng(${location.latitude}, ${location.longitude});
        var marker = new kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
        
        // 레스토랑 마커 추가
        ${restaurants && restaurants.length > 0 ? `
          // 레스토랑 데이터로 마커 생성
          var restaurants = ${JSON.stringify(restaurants)};
          
          restaurants.forEach(function(restaurant) {
            if (restaurant.latitude && restaurant.longitude) {
              var restaurantMarker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(restaurant.latitude, restaurant.longitude),
                map: map
              });
              
              // 인포윈도우 생성
              var infowindow = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px; width:150px; text-align:center;">' + restaurant.name + '</div>'
              });
              
              // 마커에 마우스오버 이벤트 등록
              kakao.maps.event.addListener(restaurantMarker, 'mouseover', function() {
                infowindow.open(map, restaurantMarker);
              });
              
              // 마커에 마우스아웃 이벤트 등록
              kakao.maps.event.addListener(restaurantMarker, 'mouseout', function() {
                infowindow.close();
              });
            }
          });
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <SectionHeader>내 주변</SectionHeader>
      </View>
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: kakaoMapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        paddingLeft: 16,
        paddingBottom: 8,
        alignItems: 'center',
        width: '100%',
    },
    mapContainer: {
        flex: 1,
        width: '100%',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },
});

export default AroundMeScreen;