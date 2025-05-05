// components/ReviewsSection.js
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewsSection = ({ reviews }) => (
  <View style={styles.wrapper}>
    <Text style={styles.header}>Bình luận của người dùng</Text>
    <FlatList
      data={reviews}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.top}>
            <Image source={{ uri: item.user.image_url }} style={styles.avatar} />
            <Text style={styles.name}>{item.user.first_name} {item.user.last_name}</Text>
          </View>
          <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Ionicons key={i} name={i < item.rating ? 'star' : 'star-outline'} size={16} color='#ffd700' />
            ))}
          </View>
          <Text style={styles.comment}>{item.comment}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có bình luận nào.</Text>}
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { margin: 16, backgroundColor: '#f2f2f2', borderRadius: 8, padding: 12 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  item: { backgroundColor: '#fff', borderRadius: 6, padding: 12, marginBottom: 10 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  name: { fontWeight: 'bold' },
  stars: { flexDirection: 'row', marginBottom: 6 },
  comment: { fontSize: 14, color: '#333', marginBottom: 6 },
  date: { fontSize: 12, color: '#999', textAlign: 'right' },
  empty: { textAlign: 'center', color: '#555' }
});

export default ReviewsSection;