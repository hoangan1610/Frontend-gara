import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Ionicons } from '@expo/vector-icons';

// Import các màn hình
import { Splash, Onboarding, Login } from './src/screens';
import LoginPage from './src/screens/auth/LoginPage';
import RegisterPage from './src/screens/auth/RegisterPage';
import ForgotPasswordPage from './src/screens/auth/ForgotPasswordPage';
import HomePage from './src/screens/home/HomePage';
import PhoneVerificationPage from './src/screens/auth/PhoneVerificationPage';
import ProfilePage from './src/screens/profile/ProfilePage'; 
import SearchScreen from './src/screens/home/SearchPage';
import EmailVerificationPage from './src/screens/auth/EmailVerificationPage';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordPage';
import EditProfileScreen from './src/screens/profile/EditProfilePage';
import ChangeEmailScreen from './src/screens/profile/ChangeEmailPage';
import ProfileScreen from './src/screens/profile/ProfilePage';
import ProductDetailScreen from './src/screens/product/ProductDetailScreen';
import CartScreen from './src/screens/product/CartScreen';
import CheckoutScreen from './src/screens/product/CheckoutScreen';
import OrderHistory from './src/screens/profile/OrderHistory';
import OrderDetail from './src/screens/profile/OrderDetail';
import ProductFollowScreen from './src/screens/profile/ProductFollowScreen';
import StatisticalPage from './src/screens/profile/StatisticalPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigator cho tab chính
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

// Tạo instance QueryClient
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="RegisterPage" component={RegisterPage} />
          <Stack.Screen name="PhoneVerificationPage" component={PhoneVerificationPage} />
          <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          
          <Stack.Screen name="Home" component={HomePage} />

          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailVerificationPage"  component={EmailVerificationPage} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ headerShown: false }} />
          <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ headerShown: false }} />
          <Stack.Screen name="ProductFollow" component={ProductFollowScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StatisticalPage" component={StatisticalPage} options={{ headerShown: false }} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
