import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../../constants/config";

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendOtp(); // Gửi OTP khi vào trang
  }, []);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Lỗi", "Mã OTP phải có 6 chữ số.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/emailOtpRoutes/verify-email-otp`, { email, otp });
      if (response.data.success) {
        Alert.alert("Thành công", "Email đã được cập nhật!");
        navigation.replace("ProfilePage", { refresh: true });
      } else {
        Alert.alert("Lỗi", "Mã OTP không chính xác!");
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Mã OTP không hợp lệ!");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực OTP</Text>
      <Text style={styles.subtitle}>Mã OTP đã được gửi đến email: {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Đang xác thực..." : "Xác thực OTP"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={sendOtp}>
        <Text style={styles.resendText}>Gửi lại OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, width: "80%", fontSize: 18, textAlign: "center" },
  button: { backgroundColor: "blue", padding: 12, borderRadius: 10, marginTop: 20, width: "80%", alignItems: "center" },
  buttonText: { color: "white", fontSize: 18 },
  resendText: { marginTop: 10, color: "red", fontSize: 16 },
});

export default OTPVerification;
