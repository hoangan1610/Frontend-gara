import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SocialLogin from '../../components/SocialLogin'; // Import component SocialLogin

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  // Xử lý đăng nhập bằng social media
  const handleFacebookLogin = () => {
    console.log('Đăng nhập bằng Facebook');
  };

  const handleGoogleLogin = () => {
    console.log('Đăng nhập bằng Google');
  };

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
  <Ionicons name="arrow-back" size={24} color={Colors.black} />
  </TouchableOpacity>


      {/* Logo HQA */}
      <Text style={styles.logo}>HQA</Text>

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Hiện hoặc ẩn mật khẩu
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPressIn={() => setShowPassword(true)} // Hiện mật khẩu khi nhấn giữ
          onPressOut={() => setShowPassword(false)} // Ẩn mật khẩu khi thả tay
        >
          <Text style={styles.showPasswordText}>👁️</Text>
        </TouchableOpacity>
      </View>

     {/* Quên mật khẩu */}
    <TouchableOpacity
      style={styles.forgotPasswordButton}
      onPress={() => navigation.navigate('ForgotPasswordPage')} // Dẫn tới trang quên mật khẩu
>
    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
</TouchableOpacity>

      {/* Nút Đăng nhập */}
      <StyledButton
        title="Đăng nhập"
        onPress={() => console.log('Đăng nhập')} // Xử lý đăng nhập
        style={{ backgroundColor: Colors.primary }}
      />

      {/* Sử dụng lại SocialLogin */}
      <SocialLogin
        onFacebookPress={handleFacebookLogin}
        onGooglePress={handleGoogleLogin}
      />

      {/* Đăng ký */}
      <View style={styles.registerContainer}>
        <Text style={styles.noAccountText}>Bạn không có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterPage')}>
          <Text style={styles.registerText}> Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  logo: {
    fontSize: 50,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    marginBottom: 40,
    color: Colors.black,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: 'OpenSans-Regular',
    fontSize: 16,
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  passwordContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    width: '100%',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 5,
    top: '35%',
    transform: [{ translateY: -10 }],
  },
  showPasswordText: {
    fontSize: 18,
    color: '#666',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    right: 40,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontFamily: 'OpenSans-Regular',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  noAccountText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'OpenSans-Regular',
  },
  registerText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'OpenSans-SemiBold',
    textDecorationLine: 'underline',
  },
});
