// app/index.tsx
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import LogoutScreen from '../src/screens/LogoutScreen';
import DashboardCustomer from '../src/screens/DashboardCustomer';
import DashboardEmployee from '../src/screens/DashboardEmployee';
import ManageUsers from '../src/screens/ManageUsers';
import AddUser from '../src/screens/AddUser';
import DetailsUsers from '../src/screens/DetailsUsers';
import ListBooks from '../src/screens/ListBooks';
import DetailsBook from '../src/screens/DetailsBook';
import ManageBooks from '../src/screens/ManageBooks';
import ReturnBook from '../src/screens/ReturnBook';
import ReturnApprove from '../src/screens/ReturnApprove';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardCustomer" component={DashboardCustomer} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardEmployee" component={DashboardEmployee} options={{ headerShown: false }} />
      <Stack.Screen name="ManageUsers" component={ManageUsers} options={{ headerShown: false }} />
      <Stack.Screen name="AddUser" component={AddUser} options={{ headerShown: false }} />
      <Stack.Screen name="DetailsUsers" component={DetailsUsers} options={{ headerShown: false }} />
      <Stack.Screen name="ListBooks" component={ListBooks} options={{ headerShown: false }} />
      <Stack.Screen name="DetailsBook" component={DetailsBook} options={{ headerShown: false }} />
      <Stack.Screen name="ManageBooks" component={ManageBooks} options={{ headerShown: false }} />
      <Stack.Screen name="ReturnBook" component={ReturnBook} options={{ headerShown: false }} />
      <Stack.Screen name="ReturnApprove" component={ReturnApprove} options={{ headerShown: false }} />
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