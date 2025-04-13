import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useUserProfile } from '../../hooks/useUserProfile';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const { profile, loading, refreshProfile } = useUserProfile();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, [refreshProfile]);

  if (loading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tải được thông tin người dùng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header với nút back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
      </View>

      <Image source={{ uri: profile.image_url }} style={styles.profileImage} />
      <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>{profile.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoText}>{profile.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày sinh:</Text>
          <Text style={styles.infoText}>
            {profile.birth ? new Date(profile.birth).toISOString().split('T')[0] : "Chưa cập nhật"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giới tính:</Text>
          <Text style={styles.infoText}>{profile.gender || "Chưa cập nhật"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoText}>{profile.address || "Chưa cập nhật"}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('EditProfile', { profile })}
      >
        <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('OrderHistory')}>
        <Text style={styles.buttonText}>Lịch sử mua hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('ProductFollow')}>
        <Text style={styles.buttonText}>Sản phẩm yêu thích</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('StatisticalPage')}>
        <Text style={styles.buttonText}>Thống kê</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  profileImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 20, borderWidth: 2, borderColor: '#2563eb', alignSelf: 'center' },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  infoContainer: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', width: 120 },
  infoText: { fontSize: 16, color: '#333', flex: 1, flexWrap: 'wrap' },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#fff', fontSize: 16 },
  errorText: { fontSize: 16, color: 'red', marginBottom: 10 },
  retryButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  retryButtonText: { color: '#fff', fontSize: 16 }
});

export default ProfileScreen;
