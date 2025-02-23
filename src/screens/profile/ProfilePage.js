import React, { useState, useEffect } from "react";
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderProfile from './HeaderProfile';
import { Colors } from '../../constants';
import CustomInput from './CustomInput';
import axios from "axios";
import { BASE_URL } from '../../constants/config';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken"); // Lấy token
        if (!token) {
          console.error("No token found");
          navigation.replace("Login"); // Chuyển về trang đăng nhập nếu không có token
          return;
        }
  
        // Gọi API
        const response = await axios.get(`${BASE_URL}/api/v1/user/get-user-info`, {
          headers: {
            Authorization: `Bearer ${token}`, // Dùng token lấy từ AsyncStorage
            'Content-Type': 'application/json',
          }
        });
        setUser(response.data); 
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu user:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);  

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken"); // Xóa token khi đăng xuất
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <HeaderProfile/>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileImageContainer}>
          <Image source={require("../../assets/images/facebook.png")} style={styles.profileImage}/>
        </View>

        <View style={styles.nameContainer}> 
          <Text style={styles.name}>{user ? user.full_name : "Loading..."}</Text>
        </View>

        <View style={styles.inputFieldsContainer}>
          <CustomInput label="Email" placeholder={user ? user.email : "email@gmail.com"} />
          <CustomInput label="Họ" placeholder={user ? user.first_name : "Họ của bạn"} />
          <CustomInput label="Tên" placeholder={user ? user.last_name : "Tên của bạn"} />
          <CustomInput label="Địa chỉ" placeholder={user ? user.address : "Địa chỉ nhà của bạn"} />
          <CustomInput label="Số điện thoại" placeholder={user ? user.phone : "Số điện thoại"} /> 
        </View>

        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editProfileText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
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
    width: "100%",
  },
  editProfileButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  }
});

export default ProfileScreen;
