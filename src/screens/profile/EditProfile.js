import React, { useState, useEffect } from "react";
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderProfile from './HeaderProfile';
import { Colors } from '../../constants';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePage from './ProfilePage' 
import OTPVerification from "../auth/OTPVerificationPage";

const EditProfile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [initialEmail, setInitialEmail] = useState(""); //Lưu email ban đầu

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No token found");
          navigation.replace("Login");
          return;
        }
  
        const response = await axios.get(`${BASE_URL}/api/v1/user/get-user-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
  
        setUser(response.data);
        setInitialEmail(response.data.email);  // Lưu email ban đầu
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu user:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);  

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        navigation.replace("Login");
        return;
      }
  
      // Nếu email mới khác email cũ thì kiểm tra email trước khi cập nhật
      if (user.email !== initialEmail.email) {
        const checkEmailResponse = await axios.post(`${BASE_URL}/api/v1/auth/check-email`, { email: user.email }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
  
        if (!checkEmailResponse.data.exists) {
          Alert.alert("Lỗi", "Email không tồn tại. Vui lòng nhập email khác!");
          return;
        }
  
        // Gửi OTP nếu email hợp lệ
        await axios.post(`${BASE_URL}/api/v1/emailOtpRoutes/send-email-otp`, { email: user.email }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
  
        // Chuyển sang trang nhập OTP
        navigation.navigate("OTPVerificationPage", { email: user.email, userData: user });
        return;
      }
  
      // Nếu email không thay đổi, cập nhật luôn thông tin
      const response = await axios.put(`${BASE_URL}/api/v1/user/update-info`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
      navigation.navigate("ProfilePage", { refresh: true });
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Cập nhật thất bại!");
    }
  };
  

  return (
    <View style={styles.container}>
      <HeaderProfile />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.profileImageContainer}>
          <Image source={require("../../assets/images/facebook.png")} style={styles.profileImage} />
          <TouchableOpacity style={styles.editIconImageContainer}>
            <Feather name={"edit-3"} size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.full_name}</Text>
        </View>

        <View style={styles.inputFieldsContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
          />

          <Text style={styles.label}>Họ</Text>
          <TextInput
            style={styles.input}
            value={user.first_name}
            onChangeText={(text) => setUser({ ...user, first_name: text })}
          />

          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={user.last_name}
            onChangeText={(text) => setUser({ ...user, last_name: text })}
          />

          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={user.address}
            onChangeText={(text) => setUser({ ...user, address: text })}
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={user.phone}
            onChangeText={(text) => setUser({ ...user, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        {/* Nút cập nhật thông tin */}
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    height: 140,
    width: 140,
    borderRadius: 100,
    overflow: "hidden"
  },
  editIconImageContainer: {
    height: 35,
    width: 35,
    backgroundColor: Colors.orange,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -28,
    marginLeft: 60,
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 10
  },
  name: {
    fontFamily: "OpenSans-Light",
    fontWeight: "bold",
    fontSize: 24,
  },
  inputFieldsContainer: {
    marginVertical: 20,
    width: "88%",
    borderRadius: 12,
    marginLeft: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    marginLeft: 5,
    marginBottom: 10
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfile;
