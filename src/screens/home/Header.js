import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config';

const Header = ({ navigation }) => {

  const [searchText, setSearchText] = useState('');
  const [profile, setProfile] = useState(null);
  const isFocused = useIsFocused();
  const [suggestions, setSuggestions] = useState([]);


  // Hàm load thông tin người dùng từ backend
  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Token không tồn tại, cần đăng nhập');
        return;
      }
      const response = await fetch(`${BASE_URL}/api/v1/user/get-user-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  // Reload profile mỗi khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      loadProfile();
    }
  }, [isFocused]);

  // Hàm gợi ý kết quả tìm kiếm
  const fetchSuggestions = async (query) => {
    if (!query || query.trim() === "") {
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
                path: item.path
            }));
            setSuggestions(formattedData);
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
    }
  };

  // Khi người dùng nhấn nút tìm kiếm trên bàn phím
  const handleSubmitEditing = () => {
    navigation.navigate('SearchScreen', { query: searchText });
  };

  // Tạo URL ảnh với timestamp để ép load lại ảnh khi có cập nhật
  const getImageUrl = () => {
    if (profile && profile.image_url) {
      return `${profile.image_url}?${new Date().getTime()}`;
    }
    return 'https://via.placeholder.com/40';
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={(text) => {
          setSearchText(text);
          fetchSuggestions(text);
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
                onPress={() => {
                  navigation.navigate('ProductDetail', { productPath: item.path })}}
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

      <TouchableOpacity onPress={() => console.log('Thông báo')}>
        <Icon name="notifications-outline" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.userAvatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    width: '60%',
    alignItems: 'center'
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 15,
    marginHorizontal: 10,
    height: 40,
    textAlignVertical: 'center',
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
    maxHeight: 400,
  },
  
  suggestionItem: {
    flexDirection: "row", 
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  
  productPrice: {
    fontSize: 14,
    color: "red",
  },
  suggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1
  }
});

export default Header;
