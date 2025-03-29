import React from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

const SlideShow = () => {
  return (
    <View style={styles.slideShow}>
      <Swiper autoplay height={200} dotStyle={styles.dot} activeDotStyle={styles.activeDot}>
        <Image 
          source={{ uri: 'https://dongdoautohd.vn/wp-content/uploads/2023/08/baner-anh-2.jpg' }}
          style={styles.slideImage}
        />
        <Image 
          source={{ uri: 'https://phukienotobinhduong.com/wp-content/uploads/2022/11/banner-02.jpg' }}
          style={styles.slideImage}
        />
        <Image 
          source={{ uri: 'https://phukiendochoioto.vn/wp-content/uploads/2023/10/Banner-1.png' }}
          style={styles.slideImage}
        />
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  slideShow: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  slideImage: {
    width: Dimensions.get('window').width,
    height: 200,
    resizeMode: 'cover',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default SlideShow;
