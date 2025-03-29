import { ImageBackground, StatusBar, StyleSheet, Text, View, FlatList, Dimensions, Animated } from 'react-native';
import React, {useState, useRef} from 'react';
import { Colors } from '../constants';
import Buttons from '../components/Buttons';
import { slides } from '../data/slides';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderItem = ({ item }) => (
   <View style={{ width, height, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', paddingTop: 50 }}>
    <ImageBackground source={item.image} style={{ width: '100%', height: height * 0.4 }} resizeMode="cover" />
    <Text style={{ fontSize: 30, fontWeight: 'bold', color: Colors.black, marginTop: 20 }}> {item.title} </Text>
    <Text style={{ fontSize: 18, color: '#777', textAlign: 'center', marginTop: 10, paddingHorizontal: 30 }}>
    {item.description} </Text>
  </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Onboarding Screens */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Nút Indicator & Get Started */}
      <View style={{ position: 'absolute', bottom: 50, width, alignItems: 'center' }}>
        {/* Dots Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          {slides.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [ (index - 1) * width, index * width, (index + 1) * width, ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: Colors.black,
                  marginHorizontal: 5,
                  opacity,
                }}
              />
            );
          })}
        </View>

        {/* Nút Get Started */}
        {currentIndex === slides.length - 1 && (
          <Buttons btn_text="Get Started" on_press={() => navigation.navigate('Login')} />
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;