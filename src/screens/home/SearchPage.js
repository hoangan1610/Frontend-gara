import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, Dimensions, ScrollView 
} from 'react-native';
import axios from 'axios';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/config';


const SearchScreen = ({ navigation, route }) => {
  const initialQuery = route.params?.query || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState(null); 

  useEffect(() => {
    fetchCategories();
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery, selectedCategory);
    }, 500);
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);     
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/category`);
  
      if (Array.isArray(response.data)) {
        setCategories(response.data); 
      } else {
        console.error("Unexpected API response format", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleSearch = async (query, category) => {
    if (!query.trim() && !category) {
      setResults([]);
      return;
    }
  
    setLoading(true);
    try {
      const params = { 
        limit: 20,
        searchTerm: query.trim() || "", 
        category_id: category || null,   
      };
      const response = await axios.get(`${BASE_URL}/api/v1/product/search`, { params });
      setResults(response.data.result.products);
    } catch (error) {
      console.error("Lỗi tìm kiếm sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };  

  //Hàm sort 
  const handleSort = (option) => {
    setSortOption(option); // Cập nhật trạng thái bộ lọc
    let sortedResults = [...results];
  
    if (option === "a-z") {
      sortedResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "z-a") {
      sortedResults.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "price-low") {
      sortedResults.sort((a, b) => a.price - b.price); // Sắp xếp tăng dần
    } else if (option === "price-high") {
      sortedResults.sort((a, b) => b.price - a.price); // Sắp xếp giảm dần
    }
  
    setResults([...sortedResults]); // Tạo mảng mới để kích hoạt re-render
  };  

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilterVisible(false);
  };

  //Hủy chọn danh mục
  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

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
      <View style={styles.searchBarContainer}>
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
        <Feather
          name="filter"
          size={24}
          color="#888"
          style={styles.filterIcon}
          onPress={() => setFilterVisible(true)} // Show filter dashboard
        />
      </View>

      <View style={styles.sortOptionsContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortOption === "a-z" && styles.activeSortButton]} 
          onPress={() => handleSort("a-z")}
        >
          <Text style={styles.sortButtonText}>A-Z</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortOption === "z-a" && styles.activeSortButton]} 
          onPress={() => handleSort("z-a")}
        >
          <Text style={styles.sortButtonText}>Z-A</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortOption === "price-low" && styles.activeSortButton]} 
          onPress={() => handleSort("price-low")}
        >
          <Text style={styles.sortButtonText}>Giá ↑</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortOption === "price-high" && styles.activeSortButton]} 
          onPress={() => handleSort("price-high")}
        >
          <Text style={styles.sortButtonText}>Giá ↓</Text>
        </TouchableOpacity>
      </View>
      
      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={!loading && searchQuery ? <Text style={styles.emptyText}>Không có kết quả nào</Text> : null}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* Dashboard Filter Panel */}
      {filterVisible && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Bộ lọc</Text>
            <Ionicons
              name="close"
              size={24}
              color="#888"
              style={styles.closeIcon}
              onPress={() => setFilterVisible(false)} 
            />
          </View>
          <Text style={styles.categoryFilterTitle}>Lọc theo danh mục</Text>
          
          <View style={styles.categoryFilterContainer}>
            {categories.map((category) => (
              <TouchableOpacity 
              key={category.id}
              style={[
                styles.filterOption, 
                selectedCategory === category.id && { backgroundColor: 'orange' } // Highlight selected category
              ]}
              onPress={() => handleCategorySelect(category.id)}
              >
                <Text 
                  style={[
                    styles.filterOptionText,
                    selectedCategory === category.id && { color: '#fff' }, 
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
              {/* Nút hủy chọn danh mục */}
            <TouchableOpacity 
              style={styles.clearFilterButton} 
              onPress={handleClearCategory}
              >
              <Text style={styles.clearFilterText}>Hủy chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterIcon: {
    marginLeft: 10,
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
  filterPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    elevation: 5,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIcon: {
    padding: 5,
  },
  categoryFilterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  clearFilterButton: {
    marginTop: 10,
    marginEnd: 70,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sortOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  sortButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSortButton: {
    backgroundColor: "orange",
  },
  sortButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default SearchScreen;
