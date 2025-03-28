import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

const markdownStyles = {
  text: { fontSize: 16, color: '#666' },
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
};

const ProductInfo = ({
  product,
  quantity,
  setQuantity,
  selectedOption,
  setSelectedOption,
  onOrder,
  showFullDetail,
  setShowFullDetail,
}) => {
  // Nếu có tùy chọn đã chọn thì sử dụng giá của tùy chọn, ngược lại dùng giá gốc của sản phẩm
  const effectivePrice = selectedOption && selectedOption.price ? Number(selectedOption.price) : Number(product.price);
  const totalPrice = effectivePrice * quantity;

  const DETAIL_LIMIT = 200;
  const detailText = product.detail || '';
  const shouldTruncate = detailText.length > DETAIL_LIMIT;
  const displayedDetail =
    showFullDetail || !shouldTruncate ? detailText : detailText.substring(0, DETAIL_LIMIT) + '...';

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {effectivePrice.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        {product.product_options && product.product_options.length > 0 && (
          <>
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsLabel}>Chọn tùy chọn:</Text>
              <View style={styles.optionsList}>
                {product.product_options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedOption && selectedOption.id === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedOption && selectedOption.id === option.id && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Bảng giá tùy chọn */}
            <View style={styles.optionsContainerBottom}>
              <Text style={styles.optionsTitle}>Bảng giá tùy chọn:</Text>
              {product.product_options.map((option) => (
                <View key={option.id} style={styles.optionItem}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <Text style={styles.optionPrice}>
                    {Number(option.price).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              <Ionicons name="remove-circle-outline" size={32} color="#ff5722" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((prev) => prev + 1)}
            >
              <Ionicons name="add-circle-outline" size={32} color="#ff5722" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.orderRow}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
            <Text style={styles.totalPriceText}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={onOrder}>
            <Text style={styles.orderButtonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
        <Markdown style={markdownStyles}>{displayedDetail}</Markdown>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setShowFullDetail(!showFullDetail)}>
            <Text style={styles.showMoreText}>{showFullDetail ? 'Ẩn bớt' : 'Xem thêm'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  productImage: { width: '100%', height: 300, resizeMode: 'cover' },
  infoContainer: { padding: 15 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  productPrice: { fontSize: 20, color: '#e53935', fontWeight: 'bold' },
  optionsContainer: { marginVertical: 10 },
  optionsLabel: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  optionsList: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ff5722',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: { backgroundColor: '#ff5722' },
  optionButtonText: { fontSize: 16, color: '#ff5722' },
  optionButtonTextSelected: { color: '#fff' },
  optionsContainerBottom: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
  },
  optionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionName: { fontSize: 16, color: '#333' },
  optionPrice: { fontSize: 16, color: '#e53935', fontWeight: 'bold' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  quantityLabel: { fontSize: 16, fontWeight: '600' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  quantityButton: { paddingHorizontal: 5 },
  quantityText: { fontSize: 20, marginHorizontal: 10 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  totalPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  totalPriceLabel: { fontSize: 16, color: '#333', marginRight: 5 },
  totalPriceText: { fontSize: 16, color: '#e53935', fontWeight: 'bold' },
  orderButton: { backgroundColor: '#ff5722', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  orderButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  markdown: { marginTop: 10 },
  showMoreText: { color: '#007bff', fontSize: 16, marginTop: 10 },
});

export default ProductInfo;
