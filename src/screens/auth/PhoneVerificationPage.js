import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config'; // Import BASE_URL từ file cấu hình
import StyledButton from '../../components/StyledButton';
import { Colors } from '../../constants';

const PhoneVerificationPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Nhận số điện thoại từ route params
  const { phone } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Hàm xác thực số điện thoại bằng OTP
  const handleVerifyPhone = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/verify-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Số điện thoại đã được xác thực');
        Alert.alert('Thành công', data.message || 'Số điện thoại đã được xác thực');
        // Sau khi xác thực thành công, chuyển hướng đến trang đăng nhập (hoặc HomePage)
        navigation.navigate('LoginPage');
      } else {
        setError(data.message || 'Xác thực số điện thoại thất bại');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    }
    setLoading(false);
  };

  // Hàm gửi lại OTP qua SMS (sử dụng endpoint /resend-otp)
  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thông báo', data.message || 'OTP đã được gửi lại');
      } else {
        Alert.alert('Lỗi', data.message || 'Gửi lại OTP thất bại');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác Thực Số Điện Thoại</Text>
      <Text style={styles.info}>Chúng tôi đã gửi mã OTP đến số điện thoại: {phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <StyledButton
          title="Xác thực"
          onPress={handleVerifyPhone}
          style={{ backgroundColor: Colors.primary }}
        />
      )}
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
      <TouchableOpacity onPress={handleResendOTP}>
        <Text style={styles.resendText}>Gửi lại OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PhoneVerificationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    marginBottom: 20,
    color: Colors.black,
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.black,
    fontFamily: 'OpenSans-Regular',
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
  resendText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 20,
    textDecorationLine: 'underline',
    fontFamily: 'OpenSans-Regular',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
    fontFamily: 'OpenSans-Regular',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'green',
    fontFamily: 'OpenSans-Regular',
  },
});
