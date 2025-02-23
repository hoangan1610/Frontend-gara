import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState(''); // dd-mm-yyyy
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  // Hàm chuyển đổi dd-mm-yyyy sang ISO (yyyy-mm-ddT00:00:00.000Z)
  const parseBirthDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return "";
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    const isoBirth = parseBirthDate(birth);
    if (!isoBirth) {
      Alert.alert("Lỗi", "Ngày sinh không đúng định dạng. Vui lòng nhập theo định dạng dd-mm-yyyy");
      return;
    }

    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      birth: isoBirth,
    };

    try {
      // Gọi API đăng ký
      const response = await fetch(`${BASE_URL}/api/v1/auth/regist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Thông báo", "Mã OTP đã được gửi đến email của bạn");
        navigation.navigate('EmailVerificationPage', { email });
      } else {
        Alert.alert("Lỗi", data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>

      <Text style={styles.title}>
        Đăng ký ngay với chúng tôi, để sử dụng ngay các dịch vụ.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPressIn={() => setShowPassword(true)}
          onPressOut={() => setShowPassword(false)}
        >
          <Text style={styles.showPasswordText}>👁️</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Họ"
        placeholderTextColor="#999"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tên"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        placeholderTextColor="#999"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày sinh (dd-mm-yyyy)"
        placeholderTextColor="#999"
        value={birth}
        onChangeText={setBirth}
      />

      <StyledButton
        title="Đăng ký"
        onPress={handleRegister}
        style={{ backgroundColor: Colors.primary }}
      />

      <View style={styles.registerContainer}>
        <Text style={styles.noAccountText}>Bạn đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginPage')}>
          <Text style={styles.registerText}> Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: 'OpenSans-Regular',
    fontSize: 16,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  passwordContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
