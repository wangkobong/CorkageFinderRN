import { Stack } from 'expo-router';
import FavoriteListScreen from '../screens/my_page/favorite_list_screen';


export default function FavoriteRestaurantsPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "즐겨찾는 레스토랑",
          headerBackTitle: "마이페이지",
          headerShown: true
        }}
      />
      <FavoriteListScreen />
    </>
  );
} 