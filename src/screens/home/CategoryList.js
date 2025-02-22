import React from 'react';
import { FlatList, View, Image, Text, StyleSheet } from 'react-native';

const CategoryList = ({ categories }) => {
  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.categoryItem}>
          <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      )}
      contentContainerStyle={styles.categoryList}
    />
  );
};

const styles = StyleSheet.create({
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CategoryList;
