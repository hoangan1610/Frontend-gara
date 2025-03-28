import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewsSection = ({ reviews }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bình luận của người dùng</Text>
      {reviews && reviews.length > 0 ? (
        reviews.map(review => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Image 
                source={{ uri: review.user.image_url }} 
                style={styles.reviewAvatar}
              />
              <Text style={styles.reviewAuthor}>
                {review.user.first_name} {review.user.last_name}
              </Text>
            </View>
            <View style={styles.reviewStars}>
              {Array(review.rating).fill().map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#ffd700" />
              ))}
              {Array(5 - review.rating).fill().map((_, i) => (
                <Ionicons key={i} name="star-outline" size={16} color="#ffd700" />
              ))}
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.infoText}>Chưa có bình luận nào.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, padding: 10, backgroundColor: '#f2f2f2', borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  reviewItem: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  reviewAuthor: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reviewStars: { flexDirection: 'row', marginBottom: 5 },
  reviewComment: { fontSize: 14, marginBottom: 5, color: '#555' },
  reviewDate: { fontSize: 12, color: '#999', textAlign: 'right' },
  infoText: { textAlign: 'center', fontSize: 16, color: '#555' },
});

export default ReviewsSection;
