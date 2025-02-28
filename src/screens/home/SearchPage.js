import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/config';

const SearchScreen = ({ navigation, route }) => {
  // Lấy query từ route.params, nếu có, và dùng làm giá trị ban đầu
  const initialQuery = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm gọi API tìm kiếm sản phẩm với parameter "searchTerm"
  const handleSearch = async (query) => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/product/search`, {
        params: {
          searchTerm: query,  // Sử dụng "searchTerm" theo backend của bạn
          limit: 20,
        },
      });
      // Giả sử kết quả trả về nằm ở response.data.result.products
      setResults(response.data.result.products);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Khi component mount, nếu có giá trị ban đầu thì gọi tìm kiếm
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Sử dụng debounce: khi searchQuery thay đổi, chờ 500ms trước khi gọi API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
    >
      <Image source={{ uri: item.image_url }} style={styles.resultImage} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.resultPrice}>{item.price} đ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={!loading && searchQuery ? <Text style={styles.emptyText}>Không có kết quả nào</Text> : null}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultPrice: {
    fontSize: 14,
    color: '#d9534f',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default SearchScreen;
