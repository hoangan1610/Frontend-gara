import { Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Splash, Onboarding, Login } from './src/screens';
import LoginPage from './src/screens/auth/LoginPage';
import RegisterPage from './src/screens/auth/RegisterPage';
import ForgotPasswordPage from './src/screens/auth/ForgotPasswordPage';
import HomePage from './src/screens/HomePage';
import PhoneVerificationPage from './src/screens/auth/PhoneVerificationPage';

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={Splash}/>
        <Stack.Screen name="Onboarding" component={Onboarding}/>
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="RegisterPage" component={RegisterPage} />
        <Stack.Screen name="PhoneVerificationPage" component={PhoneVerificationPage} />
        <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
        <Stack.Screen name="HomePage" component={HomePage} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

