// screens/LoginPage.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SocialLogin from '../../components/SocialLogin';
import { BASE_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();

  // Hàm xử lý đăng nhập qua API
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
  
    setLoading(true); // Bắt đầu loading
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Đăng nhập thành công:', data);
  
        // Lưu token vào AsyncStorage
        if (data.access_token) {
          await AsyncStorage.setItem('authToken', data.access_token);
  
          // Chuyển hướng đến HomePage sau khi lưu token
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          console.error('Token không tồn tại:', data);
          Alert.alert('Lỗi', 'Đăng nhập thành công nhưng không nhận được token');
        }
      } else {
        console.error('Đăng nhập thất bại:', data.message);
        Alert.alert('Đăng nhập thất bại', data.message || 'Vui lòng kiểm tra lại thông tin đăng nhập');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>

      {/* Logo HQA */}
      <Text style={styles.logo}>HQA</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} 
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Quên mật khẩu */}
      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => navigation.navigate('ForgotPasswordPage')}
      >
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <StyledButton
        title="Đăng nhập"
        onPress={handleLogin}
        style={{ backgroundColor: Colors.primary }}
        disabled={loading} 
      />

      {/* Hiển thị Loading khi đang đăng nhập */}
      {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}

      {/* Sử dụng lại SocialLogin */}
      <SocialLogin />

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
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    marginBottom: 30,
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
    right: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    right: 20,
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
