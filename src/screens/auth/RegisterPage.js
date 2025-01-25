import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>

      {/* Chữ Đăng ký */}
      <Text style={styles.title}>
        Đăng ký ngay với chúng tôi, để sử dụng ngay các dịch vụ.
      </Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
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

      {/* Nhập lại Mật khẩu */}
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword} // Hiện hoặc ẩn mật khẩu
      />

      {/* Họ Input */}
      <TextInput
        style={styles.input}
        placeholder="Họ"
        placeholderTextColor="#999"
        value={lastName}
        onChangeText={setLastName}
      />

      {/* Tên Input */}
      <TextInput
        style={styles.input}
        placeholder="Tên"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={setFirstName}
      />

      {/* Địa chỉ Input */}
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        placeholderTextColor="#999"
        value={address}
        onChangeText={setAddress}
      />

      {/* Số điện thoại Input */}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Giới tính Dropdown */}
      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>Giới tính</Text>
        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Nam" value="male" />
          <Picker.Item label="Nữ" value="female" />
          <Picker.Item label="Khác" value="other" />
        </Picker>
      </View>

      {/* Nút Đăng ký */}
      <StyledButton
        title="Đăng ký"
        onPress={() => console.log('Đăng ký')} // Xử lý đăng ký
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
  genderContainer: {
    width: '90%',
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
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
