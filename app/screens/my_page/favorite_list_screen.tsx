import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RestaurantCard } from '@/api/models/restaurant';
import RestaurantCardView from '@/app/screens/home/component/restaurant_card';
import { useMyfavoriteData } from '../../../hooks/mypage/useMyfavoriteData';

const FavoriteListScreen = () => {
    const { 
        loading, 
        error, 
        filteredRestaurants, 
        searchQuery, 
        selectedFilter,
        categories, 
        handleTapFavoriteRestaurant, 
        filterRestaurantsByCategory,
        handleSearchChange,
        clearSearch
    } = useMyfavoriteData();

    const searchBarSection = () => {
        return (
            <View style={styles.searchBarSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="레스토랑 이름 검색"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    const filterSection = () => {
        return (
            <View style={styles.filterSection}>
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterItem,
                                selectedFilter === item.id && styles.filterItemSelected
                            ]}
                            onPress={() => filterRestaurantsByCategory(item.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedFilter === item.id && styles.filterTextSelected
                                ]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>
        )
    }

    const renderRestaurantItem = ({ item }: { item: RestaurantCard }) => (
        <RestaurantCardView 
            restaurant={item}
            onPress={() => handleTapFavoriteRestaurant(item)}
        />
    );

    const favoriteListSection = () => {
        return (
            <View style={styles.favoriteListSection}>
                {loading ? (
                    <View style={styles.centerContent}>
                        <Text style={styles.loadingText}>로딩 중...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>{error}</Text>
                    </View>
                ) : filteredRestaurants.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="heart-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>즐겨찾기한 레스토랑이 없습니다.</Text>
                        <Text style={styles.emptySubText}>레스토랑 상세 페이지에서 하트를 눌러 즐겨찾기에 추가해보세요.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item.restaurantID}
                        renderItem={renderRestaurantItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {searchBarSection()}
            {filterSection()}
            {favoriteListSection()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchBarSection: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterSection: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterList: {
        paddingHorizontal: 16,
    },
    filterItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    filterItemSelected: {
        backgroundColor: '#4A6FE7',
    },
    filterText: {
        fontSize: 14,
        color: '#555',
    },
    filterTextSelected: {
        color: '#fff',
    },
    favoriteListSection: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default FavoriteListScreen;

