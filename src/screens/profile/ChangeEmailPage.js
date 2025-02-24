import React, { useState } from 'react';
import { 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';

const ChangeEmailScreen = ({ route, navigation }) => {
  // Nhận profile từ route.params nếu có
  const { profile } = route.params || {};
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: nhập email mới, 2: nhập OTP
  const [loading, setLoading] = useState(false);

  // Gửi OTP đến email mới (chuẩn hóa email)
  const sendOtp = async () => {
    if (!newEmail) {
      Alert.alert("Lỗi", "Vui lòng nhập email mới");
      return;
    }
    const normalizedEmail = newEmail.trim().toLowerCase();
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/v1/user/send-update-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
        setStep(2);
      } else {
        Alert.alert("Lỗi", data.message || "Không gửi được OTP");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi khi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP và cập nhật email mới (chuẩn hóa email)
  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }
    const normalizedEmail = newEmail.trim().toLowerCase();
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/v1/user/verify-update-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: normalizedEmail, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Email đã được xác thực");
        // Chuyển về EditProfile, truyền profile và updatedEmail (đã chuẩn hóa)
        navigation.navigate('EditProfile', { profile, updatedEmail: normalizedEmail });
      } else {
        Alert.alert("Lỗi", data.message || "Không xác thực được OTP");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi khi xác thực OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.label}>Nhập email mới:</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Nhập email mới"
          />
          <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Nhập mã OTP:</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholder="Nhập mã OTP"
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Xác thực OTP</Text>}
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity 
        style={[styles.button, styles.cancelButton]} 
        onPress={() => navigation.navigate('EditProfile', { profile, updatedEmail: newEmail.trim().toLowerCase() })}
      >
        <Text style={styles.buttonText}>Hủy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    height: 45,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChangeEmailScreen;
