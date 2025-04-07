
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { userApi } from '../services/apiServices.ts';
import { useNavigation } from '@react-navigation/native';

const AddUserScreen = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_employee: false,
    is_active: true,
  });

  const navigation = useNavigation();
  const goBack = () => navigation.goBack();

  const handleChange = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.username || !form.email || !form.password) {
        Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione!');
        return;
      }

      const userData = {
        ...form,
        is_employee: form.is_employee ? true : false,
        is_active: form.is_active ? true : false,
      };

      await userApi.addUser(userData);
      Alert.alert('Sukces', 'Użytkownik został dodany pomyślnie!');
      navigation.navigate('ManageUsers');
    } catch (error) {
      console.error('Błąd przy dodawaniu użytkownika:', error);
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się dodać użytkownika'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Dodaj użytkownika</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nazwa użytkownika"
          placeholderTextColor="#666"
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Imię"
          placeholderTextColor="#666"
          value={form.first_name}
          onChangeText={(text) => handleChange('first_name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Nazwisko"
          placeholderTextColor="#666"
          value={form.last_name}
          onChangeText={(text) => handleChange('last_name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Hasło"
          placeholderTextColor="#666"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Zapisz użytkownika</Text>
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  submitButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
  },
  submitButtonText: {
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 28,
    color: '#f9f7f1',
    fontWeight: 'bold',
  },
});

export default AddUserScreen;