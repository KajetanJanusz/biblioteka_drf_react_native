// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { login } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardCustomer' }],
      });
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };
  const route = useRoute();
const message = route.params?.message;

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      {message && <Text style={styles.successMessage}>{message}</Text>}
      <Text style={styles.title}>Library App</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#666"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#666"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginScreen;