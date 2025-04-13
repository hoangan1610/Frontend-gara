import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_ITEMS = 10;

// Tạo object an toàn chứa thông tin cần thiết của sản phẩm
const createSafeProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    image: product.image_url || "https://via.placeholder.com/150",
    price: product.price,
    path: product.path,
  };
};

// Thêm sản phẩm vào danh sách đã xem
export const addToRecentlyViewed = async (product) => {
  try {
    if (typeof product !== 'object' || product === null) {
      console.error('Sản phẩm không hợp lệ:', product);
      return;
    }
    const safeProduct = createSafeProduct(product);

    const existing = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let viewed = [];

    try {
      viewed = existing ? JSON.parse(existing) : [];
    } catch (e) {
      console.error("Dữ liệu recentlyViewed bị lỗi khi parse:", existing);
      await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
      viewed = [];
    }

    // Xoá nếu đã tồn tại
    viewed = viewed.filter(item => item.id !== safeProduct.id);

    // Thêm mới lên đầu
    viewed.unshift(safeProduct);

    // Giới hạn số lượng lưu
    if (viewed.length > MAX_ITEMS) {
      viewed = viewed.slice(0, MAX_ITEMS);
    }

    try {
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed));
    } catch (e) {
      console.error('Lỗi khi lưu vào AsyncStorage:', e);
    }    
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm đã xem:', error);
  }
};

// Lấy danh sách sản phẩm đã xem
export const getRecentlyViewed = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm đã xem:', error);
    return [];
  }
};
