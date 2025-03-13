import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleText } from '../../components/title_text';
import { HomeRestaurantCategory, RestaurantCategoryInfo } from '../../models/restaurant_category';

const HomeScreen = () => {

    const titleSection = () => {
        return (
            <View style={styles.titleSection}>
                <TitleText>CorkageFinder</TitleText>
            </View>
        );
    }

    const foodTypeSection = () => {
        // 모든 카테고리 가져오기
        const foodCategories = RestaurantCategoryInfo.allCases();

        return (
            <View style={styles.foodTypeSection}>
                <View style={styles.gridContainer}>
                    {/* 첫 번째 줄 */}
                    <View style={styles.row}>
                        {foodCategories.slice(0, 3).map(category => (
                            <TouchableOpacity 
                                key={category} 
                                style={styles.gridItem}
                                onPress={() => console.log(`${RestaurantCategoryInfo.getTitle(category)} 선택됨`)}
                            >
                                <Text style={styles.foodTypeEmoji}>{RestaurantCategoryInfo.getEmoji(category)}</Text>
                                <Text style={styles.foodTypeText}>{RestaurantCategoryInfo.getTitle(category)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* 두 번째 줄 */}
                    <View style={styles.row}>
                        {foodCategories.slice(3, 6).map(category => (
                            <TouchableOpacity 
                                key={category} 
                                style={styles.gridItem}
                                onPress={() => console.log(`${RestaurantCategoryInfo.getTitle(category)} 선택됨`)}
                            >
                                <Text style={styles.foodTypeEmoji}>{RestaurantCategoryInfo.getEmoji(category)}</Text>
                                <Text style={styles.foodTypeText}>{RestaurantCategoryInfo.getTitle(category)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                alwaysBounceVertical={false}
                overScrollMode="never"
            >
                {titleSection()}
                {foodTypeSection()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        width: '100%',
    },
    scrollViewContent: {
        // flexGrow: 1 제거 - 이 속성이 내용물이 적어도 전체 화면을 채우게 함
        // 대신 컨텐츠의 자연스러운 크기대로 표시
    },
    titleSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        alignItems: 'flex-start',
        width: '100%',
    },
    foodTypeSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        alignItems: 'flex-start',
        width: '100%',
    },
    gridContainer: {
        marginTop: 16,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridItem: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    foodTypeEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    foodTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;