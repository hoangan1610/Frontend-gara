// screens/Login.js
import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Hình ảnh lớn */}
      <Image
        source={require('../../assets/images/login-image.png')} 
        style={styles.image}
      />

      {/* Nút Login */}
      <StyledButton
        title="Login"
        onPress={() => navigation.navigate('LoginPage')}
        style={{ backgroundColor: Colors.primary }}
      />

      {/* Nút Register */}
      <StyledButton
        title="Register"
        onPress={() => navigation.navigate('RegisterPage')}
        style={{ backgroundColor: Colors.green}}
      />

      {/* Continue as Guest */}
      <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  guestText: {
    fontSize: 14,
    color: '#6c757d', 
    marginTop: 20,
    textDecorationLine: 'underline',
    fontFamily: 'OpenSans-Regular',
  },
});
