import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import { WebView } from 'react-native-webview';
import { KAKAO_JS_KEY } from '@env';
const AroundMeScreen = () => {
  const [location, setLocation] = useState({
    latitude: 37.566826,  // 서울 시청 기본값
    longitude: 126.9786567
  });

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
          level: 3
        };
        var map = new kakao.maps.Map(container, options);
        var markerPosition = new kakao.maps.LatLng(${location.latitude}, ${location.longitude});
        var marker = new kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <TitleText>내 주변</TitleText>
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