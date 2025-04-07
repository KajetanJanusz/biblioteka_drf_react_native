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
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { login } from '../services/authService';
import { useNavigation, useRoute } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const message = route.params?.message;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Błąd', 'Wprowadź nazwę użytkownika i hasło');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardCustomer' }],
      });
    } catch (error) {
      Alert.alert(
        'Błąd logowania',
        error.response?.data?.detail || 'Wystąpił błąd podczas logowania'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Biblioteka</Text>
        <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>

        {message && <Text style={styles.successMessage}>{message}</Text>}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="E-mail"
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Hasło"
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
            <ActivityIndicator color="#f9f7f1" />
          ) : (
            <Text style={styles.buttonText}>Zaloguj</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text>Nie masz jeszcze konta? </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerText}>Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f7f1',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  loginButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    marginTop: 8,
  },
  buttonText: {
    color: '#f9f7f1',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#1e88e5',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
});

export default LoginScreen;
