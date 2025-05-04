import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Text style={{ textAlign: 'center', color: '#666', marginVertical: 10 }}>
        Chưa có đánh giá nào
      </Text>
    );
  }

  return (
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Các đánh giá
      </Text>
      {reviews.map((review, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          {review.user?.image_url && (
            <Image
              source={{ uri: review.user.image_url }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', marginRight: 5 }}>
                {review.user?.first_name && review.user?.last_name
                  ? `${review.user.first_name} ${review.user.last_name}`
                  : 'Người dùng'}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-border'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
            <Text style={{ color: '#666', marginTop: 5 }}>{review.comment}</Text>
            <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ReviewsSection;