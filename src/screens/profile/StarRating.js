import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StarRating = ({ rating, setRating }) => {
  return (
    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={{ marginRight: 5 }}
        >
          <Icon
            name={star <= rating ? 'star' : 'star-border'}
            size={30}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StarRating;