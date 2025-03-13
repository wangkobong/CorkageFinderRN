import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { TitleText } from '../../components/title_text';
const MyPageScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <TitleText>마이페이지</TitleText>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default MyPageScreen;
