import React, { useState, useRef, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config';
import { emitter } from '../../utils/eventEmitter';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCart } from '../../hooks/useCart';

const DEBOUNCE_DELAY = 500; // 500ms

const Header = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimerRef = useRef(null);

  const { profile, refreshProfile } = useUserProfile();
  const { cart, loadCart } = useCart();

  // Chỉ gọi API nếu dữ liệu chưa có (để tránh gọi liên tục khi focus)
  useFocusEffect(
    useCallback(() => {
      if (!profile) refreshProfile();
      if (!cart) loadCart();
    }, [refreshProfile, loadCart, profile, cart])
  );

  // Đăng ký sự kiện cập nhật giỏ hàng để luôn load cart mới khi có sự thay đổi
  React.useEffect(() => {
    const subscription = emitter.addListener('cartUpdated', () => {
      loadCart(true);
    });
    return () => subscription.remove();
  }, [loadCart]);

  const debouncedFetchSuggestions = (query) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(query), DEBOUNCE_DELAY);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/product/search?searchTerm=${query}`);
      const data = await response.json();
      if (response.ok) {
        const formattedData = data.result.products.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url || "https://via.placeholder.com/150",
          path: item.path,
        }));
        setSuggestions(formattedData);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    }
  };

  const handleSubmitEditing = () => {
    navigation.navigate('SearchScreen', { query: searchText });
  };

  const getImageUrl = () => {
    if (profile && profile.image_url) return `${profile.image_url}?${new Date().getTime()}`;
    return 'https://via.placeholder.com/40';
  };

  const cartCount = cart && cart.cart_items ? cart.cart_items.length : 0;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            debouncedFetchSuggestions(text);
          }}
          returnKeyType="search"
          onSubmitEditing={handleSubmitEditing}
        />
        {suggestions.length > 0 && searchText.trim() && (
          <View style={styles.suggestionsContainer}>
            <FlatList 
              data={suggestions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.suggestionItem} 
                  onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
                >
                  <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                  <View style={styles.textContainer}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price.toLocaleString()} VNĐ</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false} 
            />
          </View>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartContainer}>
        <Icon name="cart-outline" size={24} color="#000" />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('Thông báo')}>
        <Icon name="notifications-outline" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Image source={{ uri: getImageUrl() }} style={styles.userAvatar} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff' },
  searchContainer: { width: '60%', alignItems: 'center' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 20, width: '100%', paddingHorizontal: 15, marginHorizontal: 10, height: 40, textAlignVertical: 'center' },
  userAvatar: { width: 35, height: 35, borderRadius: 20, borderWidth: 2, borderColor: '#2563eb' },
  suggestionsContainer: { position: "absolute", top: 50, left: 0, right: 0, backgroundColor: "white", borderRadius: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, zIndex: 10, maxHeight: 400 },
  suggestionItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  productName: { fontSize: 16, fontWeight: "bold" },
  productPrice: { fontSize: 14, color: "red" },
  suggestionImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  textContainer: { flex: 1 },
  cartContainer: { position: 'relative', padding: 5 },
  badge: { position: 'absolute', right: 0, top: -5, backgroundColor: 'red', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});

export default Header;
