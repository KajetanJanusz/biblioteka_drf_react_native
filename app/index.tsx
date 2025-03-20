// app/index.tsx
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import DashboardCustomer from '../src/screens/DashboardCustomer';
import ListBooks from '../src/screens/ListBooks';
import DetailsBook from '../src/screens/DetailsBook';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DashboardCustomer" component={DashboardCustomer} />
      <Stack.Screen name="ListBooks" component={ListBooks} />
      <Stack.Screen name="DetailsBook" component={DetailsBook} />
    </Stack.Navigator>
  );
}

// Re-export components if needed
export { LoginScreen, RegisterScreen };

// Types for router
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};