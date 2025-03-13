import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AroundMeScreen = () => {
  return (
    <View style={styles.container}>
        <Text>AroundMeScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AroundMeScreen;