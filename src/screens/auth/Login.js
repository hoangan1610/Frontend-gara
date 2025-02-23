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
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('LoginPage')}
        style={[styles.button, { backgroundColor: Colors.primary }]}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Nút Register */}
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('RegisterPage')}
        style={[styles.button, { backgroundColor: Colors.green }]}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

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
    height: 400,  // Giảm chiều cao để nút Login không bị sát quá
    resizeMode: 'contain',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestText: {
    fontSize: 14,
    color: '#007bff', 
    marginTop: 20,
    textDecorationLine: 'underline',
    fontFamily: 'OpenSans-Regular',
  },
});
