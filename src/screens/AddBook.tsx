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
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { bookApi } from '../services/apiServices.ts';
import { useNavigation } from '@react-navigation/native';

const categoryMap = {
  1: 'Science Fiction',
  2: 'Fantasy',
  3: 'History',
  4: 'Biography',
  5: 'Literature',
};

const AddBookScreen = () => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    published_date: '',
    isbn: '',
    total_copies: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const navigation = useNavigation();
  const goBack = () => navigation.goBack();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateConfirm = (date) => {
    setForm((prev) => ({ ...prev, published_date: date.toISOString().split('T')[0] }));
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.author || !form.category || !form.isbn || !form.total_copies) {
        Alert.alert('Błąd', 'Wszystkie wymagane pola muszą być wypełnione!');
        return;
      }

      const bookData = {
        ...form,
        total_copies: parseInt(form.total_copies, 10),
      };

      await bookApi.addBook(bookData);
      Alert.alert('Sukces', 'Książka została dodana pomyślnie!');
      navigation.navigate('ManageBooks');
    } catch (error) {
      console.error('Błąd przy dodawaniu książki:', error);
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się dodać książki'
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
          <Text style={styles.title}>Dodaj książkę</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Tytuł"
          placeholderTextColor="#666"
          value={form.title}
          onChangeText={(text) => handleChange('title', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Autor"
          placeholderTextColor="#666"
          value={form.author}
          onChangeText={(text) => handleChange('author', text)}
        />
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            handleChange('category', value);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Wybierz kategorię" value="" />
          {Object.entries(categoryMap).map(([key, label]) => (
            <Picker.Item key={key} label={label} value={key} />
          ))}
        </Picker>
        <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisibility(true)}>
          <Text style={{ color: form.published_date ? '#000' : '#666' }}>
            {form.published_date || 'Data publikacji (YYYY-MM-DD)'}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="ISBN"
          placeholderTextColor="#666"
          value={form.isbn}
          onChangeText={(text) => handleChange('isbn', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Liczba egzemplarzy"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={form.total_copies}
          onChangeText={(text) => handleChange('total_copies', text)}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Dodaj książkę</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e88e5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e88e5',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateInput: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#1e88e5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddBookScreen;
