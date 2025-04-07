// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { register } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są takie same');
      return;
    }

    setIsLoading(true);
    try {
      await register({ username, email, password, first_name: firstName, last_name: lastName });
      Alert.alert(
        'Rejestracja zakończona',
        'Możesz teraz zalogować się do swojego konta',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Wystąpił błąd podczas rejestracji'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Rejestracja</Text>
        <Text style={styles.subtitle}>Utwórz nowe konto</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nazwa użytkownika</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Wybierz nazwę użytkownika"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Podaj adres e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Imię</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Wpisz swoje imię"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nazwisko</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Wpisz swoje nazwisko"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Utwórz hasło"
            secureTextEntry
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Powtórz hasło</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Wpisz ponownie hasło"
            secureTextEntry
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Zarejestruj się</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text>Masz już konto? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Zaloguj się</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexGrow: 1,
    backgroundColor: '#f9f7f1',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  registerButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    marginTop: 10,
  },
  buttonText: {
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#1e88e5',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
