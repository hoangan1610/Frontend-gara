import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '../../constants/config';
import { useUserProfile } from '../../hooks/useUserProfile';

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const EditProfileScreen = ({ route, navigation }) => {
  // Nhận thông tin profile ban đầu từ route.params nếu có
  const { profile: initialProfile = {}, updatedEmail } = route.params || {};
  const { profile, refreshProfile } = useUserProfile();

  // Dùng dữ liệu từ cache hoặc route để khởi tạo state
  const [email, setEmail] = useState(initialProfile.email || '');
  const [firstName, setFirstName] = useState(initialProfile.first_name || '');
  const [lastName, setLastName] = useState(initialProfile.last_name || '');
  const [phoneInput, setPhoneInput] = useState(initialProfile.phone || '');
  const [birth, setBirth] = useState(initialProfile.birth ? new Date(initialProfile.birth).toISOString().split('T')[0] : '');
  const [gender, setGender] = useState(initialProfile.gender || '');
  const [address, setAddress] = useState(initialProfile.address || '');
  const [imageUri, setImageUri] = useState(initialProfile.image_url);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (updatedEmail) setEmail(updatedEmail);
  }, [updatedEmail]);

  // Nếu profile từ hook đã có, cập nhật state
  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '');
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhoneInput(profile.phone || '');
      setBirth(profile.birth ? new Date(profile.birth).toISOString().split('T')[0] : '');
      setGender(profile.gender || '');
      setAddress(profile.address || '');
      setImageUri(profile.image_url);
    }
  }, [profile]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Quyền truy cập bị từ chối", "Bạn cần cấp quyền truy cập thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return null;
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'samples/ecommerce');
    try {
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        Alert.alert("Lỗi", data.error?.message || "Không upload được ảnh");
        return null;
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi khi upload ảnh");
      return null;
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const uploadedImageUrl = await uploadImage();
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập");
        setLoading(false);
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const payload = {
        id: profile.id,
        first_name: firstName,
        last_name: lastName,
        phone: phoneInput,
        birth,
        gender,
        address,
        image_url: uploadedImageUrl || imageUri,
      };
      if (normalizedEmail !== (initialProfile.email || '').trim().toLowerCase()) {
        payload.email = normalizedEmail;
        payload.email_verified = true;
      }
      const response = await fetch(`${BASE_URL}/api/v1/user/update-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Profile đã được cập nhật");
        // Cập nhật cache mới
        await AsyncStorage.setItem('cachedProfile', JSON.stringify({
          ...profile,
          first_name: firstName,
          last_name: lastName,
          phone: phoneInput,
          birth,
          gender,
          address,
          image_url: uploadedImageUrl || imageUri,
          email: payload.email ? payload.email : profile.email,
        }));
        await AsyncStorage.setItem('cachedProfileTimestamp', Date.now().toString());
        navigation.navigate('Profile');
      } else {
        Alert.alert("Lỗi", data.message || "Không cập nhật được profile");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
        <Text style={styles.changeImage}>Chọn ảnh mới</Text>
      </TouchableOpacity>
      <View style={styles.field}>
        <Text style={styles.label}>Họ:</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Tên:</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{email}</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('ChangeEmail', { profile })}>
          <Text style={styles.smallButtonText}>Chỉnh sửa email</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại:</Text>
        <TextInput style={styles.input} value={phoneInput} onChangeText={setPhoneInput} keyboardType="phone-pad" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Ngày sinh:</Text>
        <TextInput style={styles.input} value={birth} onChangeText={setBirth} placeholder="YYYY-MM-DD" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Giới tính:</Text>
        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Nam/Nữ" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Địa chỉ:</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Lưu thông tin</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.buttonText}>Hủy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f8f9fa' },
  profileImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 20, borderWidth: 2, borderColor: '#2563eb' },
  changeImage: { textAlign: 'center', color: '#2563eb', marginBottom: 20, fontSize: 16 },
  field: { width: '100%', marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, color: '#555' },
  input: { height: 45, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  info: { fontSize: 16, marginBottom: 5, color: '#333' },
  smallButton: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginTop: 5, alignSelf: 'flex-start' },
  smallButtonText: { color: '#fff', fontSize: 14 },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginTop: 15, width: '100%', alignItems: 'center' },
  cancelButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default EditProfileScreen;
