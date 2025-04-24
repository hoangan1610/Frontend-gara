import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Helper function to render membership level and loyalty points.
  const renderMembership = () => {
    const points = profile.loyaltyPoints;
    let membershipLevel = '';
    let membershipIcon = null;

    // Determine membership level based on loyaltyPoints.
    if (points >= 100) {
      membershipLevel = 'Thành viên Vàng';
      membershipIcon = <Icon name="star" size={16} color="gold" />;  // gold icon
    } else if (points >= 50) {
      membershipLevel = 'Thành viên Bạc';
      membershipIcon = <Icon name="star-half" size={16} color="silver" />;  // silver icon
    } else {
      membershipLevel = 'Thành viên Đồng';
      membershipIcon = <Icon name="star-outline" size={16} color="#cd7f32" />; // bronze icon
    }

    return (
      <View style={styles.membershipContainer}>
        {membershipIcon}
        <Text style={styles.membershipText}>{membershipLevel} ({points} điểm)</Text>
      </View>
    );
  };

  // Handle logout
  const handleLogout = async () => {
    // Optionally confirm action
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              // You might also want to clear cached profile data:
              await AsyncStorage.removeItem('cachedProfile');
              await AsyncStorage.removeItem('cachedProfileTimestamp');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
            }
          } 
        }
      ]
    );
  };

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
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
      </View>

      <Image source={{ uri: profile.image_url }} style={styles.profileImage} />
      <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
      {/* Display membership level and loyalty points just below the name */}
      {renderMembership()}

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

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('EditProfile', { profile })}
        >
          <Text style={styles.actionButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.actionButtonText}>Lịch sử mua hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('ProductFollow')}
        >
          <Text style={styles.actionButtonText}>Sản phẩm yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('StatisticalPage')}
        >
          <Text style={styles.actionButtonText}>Thống kê</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={16} color="#fff" />
          <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  profileImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 20, borderWidth: 2, borderColor: '#2563eb', alignSelf: 'center' },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  membershipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  membershipText: { marginLeft: 4, fontSize: 14, color: '#555' },
  infoContainer: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', width: 120 },
  infoText: { fontSize: 16, color: '#333', flex: 1, flexWrap: 'wrap' },
  buttonGroup: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#e74c3c', // using a red color for logout
  },
  errorText: { fontSize: 16, color: 'red', marginBottom: 10 },
  retryButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  retryButtonText: { color: '#fff', fontSize: 16 }
});

export default ProfileScreen;
