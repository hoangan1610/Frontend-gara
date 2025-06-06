import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

const StatisticalPage = ({ navigation}) => {
  const [selectedStatus, setSelectedStatus] = useState("FINISHED"); // Mặc định chọn trạng thái "FINISHED"
  const [cashflowData, setCashflowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState({
    PENDING: 0,
    DELIVERING: 0,
    FINISHED: 0,
  });

  // Hàm gọi API để lấy dữ liệu thống kê dòng tiền
  const fetchCashflowData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
  
      const response = await fetch(`${BASE_URL}/api/v1/order/cashflow`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Server Error:', text);
        throw new Error(`HTTP status ${response.status}`);
      }
  
      const resData = await response.json();
  
      if (resData && Array.isArray(resData.data)) {
        const formattedData = resData.data.map((item) => ({
          month: item.month,
          PENDING: parseFloat(item.PENDING) || 0,
          DELIVERING: parseFloat(item.DELIVERING) || 0,
          FINISHED: parseFloat(item.FINISHED) || 0,
        }));
  
        setCashflowData(formattedData);
  
        // Tính tổng cho từng trạng thái
        const totalPending = formattedData.reduce((sum, item) => sum + item.PENDING, 0);
        const totalDelivering = formattedData.reduce((sum, item) => sum + item.DELIVERING, 0);
        const totalFinished = formattedData.reduce((sum, item) => sum + item.FINISHED, 0);
  
        setTotalAmount({
          PENDING: totalPending,
          DELIVERING: totalDelivering,
          FINISHED: totalFinished,
        });
      } else {
        console.error('Dữ liệu không hợp lệ:', resData);
        setCashflowData([]);
        setTotalAmount({ PENDING: 0, DELIVERING: 0, FINISHED: 0 });
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu dòng tiền:', err);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu thống kê');
      setCashflowData([]);
      setTotalAmount({ PENDING: 0, DELIVERING: 0, FINISHED: 0 });
    } finally {
      setLoading(false);
    }
  };  
  
  useEffect(() => {
    fetchCashflowData();
  }, [selectedStatus]);

  const chartData = {
    labels: cashflowData.map(item => `T${item.month}`),
    datasets: [
      {
        data: cashflowData.map(item => item[selectedStatus]), // lấy đúng theo trạng thái đang chọn
      },
    ],
  };

  return (
    <View style={styles.container}>
  
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biểu đồ dòng tiền</Text>
      </View>
  
      {/* Dropdown để chọn trạng thái đơn hàng */}
      <RNPickerSelect
        onValueChange={value => setSelectedStatus(value)}
        value={selectedStatus}
        items={[
          { label: 'Chờ xác nhận (PENDING)', value: 'PENDING' },
          { label: 'Đang giao (DELIVERING)', value: 'DELIVERING' },
          { label: 'Đã giao (FINISHED)', value: 'FINISHED' },
        ]}
        style={pickerSelectStyles}
        placeholder={{}}
      />
  
      {/* Nếu đang tải dữ liệu thì hiển thị loading spinner */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <View>
          <ScrollView horizontal>
            {/* Biểu đồ cột */}
            <BarChart
              data={chartData}
              width={Math.max(screenWidth, cashflowData.length * 60)} // Mỗi tháng rộng 60px
              height={280}
              yAxisLabel="₫"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 8,
              }}
            />
          </ScrollView>
  
          {/* Hiển thị tổng số tiền bên dưới biểu đồ */}

          <View style={{ marginTop: 10 }}>
            <Text style={styles.totalText}>Tổng số tiền theo trạng thái:</Text>
            <Text style={styles.textStatus}>Chờ xác nhận (PENDING): {totalAmount.PENDING.toLocaleString()} ₫</Text>
            <Text style={styles.textStatus}>Đang giao (DELIVERING): {totalAmount.DELIVERING.toLocaleString()} ₫</Text>
            <Text style={styles.textStatus}>Đã giao (FINISHED): {totalAmount.FINISHED.toLocaleString()} ₫</Text>
          </View>
        </View>
      )}
    </View>
  );  
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginLeft: 10, marginTop: 5, paddingVertical: 10, },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  textStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 6,
    color: 'black',
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 6,
    color: 'black',
    marginBottom: 10,
  },
};

export default StatisticalPage;
