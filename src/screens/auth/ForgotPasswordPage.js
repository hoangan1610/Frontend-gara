import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      {/* Mô tả */}
      <Text style={styles.description}>
        Nhập Email đã đăng ký của bạn để reset lại mật khẩu
      </Text>

      {/* Nhập Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />

      {/* Nút Đặt lại mật khẩu */}
      <StyledButton
        title="Đặt lại mật khẩu"
        onPress={() => console.log('Đặt lại mật khẩu')} // Xử lý reset mật khẩu
        style={{ backgroundColor: Colors.primary }}
      />
    </View>
  );
};

export default ForgotPasswordPage;

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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    marginBottom: 10,
    color: Colors.black,
  },
  description: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'OpenSans-Regular',
    marginBottom: 30,
    textAlign: 'center',
    width: '80%',
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
});
