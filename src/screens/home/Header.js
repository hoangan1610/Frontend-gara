import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config';

const Header = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [profile, setProfile] = useState(null);
  const isFocused = useIsFocused();

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
      <TextInput 
        style={styles.searchInput}
        placeholder="Tìm kiếm..."
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        onSubmitEditing={handleSubmitEditing}
      />
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
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
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
});

export default Header;
