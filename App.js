import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Splash, Onboarding, Login } from './src/screens';
import LoginPage from './src/screens/auth/LoginPage';
import RegisterPage from './src/screens/auth/RegisterPage';
import ForgotPasswordPage from './src/screens/auth/ForgotPasswordPage';
import HomePage from './src/screens/home/HomePage';
import PhoneVerificationPage from './src/screens/auth/PhoneVerificationPage';
import ProfilePage from './src/screens/ProfilePage'; // Tạo file ProfileScreen nếu chưa có
import { Ionicons } from '@expo/vector-icons';
import SearchScreen from './src/screens/home/SearchPage';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="RegisterPage" component={RegisterPage} />
        <Stack.Screen name="PhoneVerificationPage" component={PhoneVerificationPage} />
        <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
        {/* Sau khi xác thực, chuyển đến MainNavigator có 2 tab Home & Profile */}
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
