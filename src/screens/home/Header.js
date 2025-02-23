import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  // Khi người dùng nhấn nút tìm kiếm trên bàn phím
  const handleSubmitEditing = () => {
    // Điều hướng đến SearchScreen và truyền searchText vào
    navigation.navigate('SearchScreen', { query: searchText });
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
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
      <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
        <Image
          source={{ uri: 'https://via.placeholder.com/40' }}
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
    height: 40,               // Tăng chiều cao
    textAlignVertical: 'center', // Căn giữa nội dung theo chiều dọc (Android)
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Header;
