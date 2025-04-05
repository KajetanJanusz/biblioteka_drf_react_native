import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { bookApi } from '../services/apiServices.ts';
import { useNavigation, useRoute } from '@react-navigation/native';

const categoryMap = {
  1: 'Science Fiction',
  2: 'Fantasy',
  3: 'History',
  4: 'Biography',
  5: 'Literature',
};

const EditBook = () => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    published_date: '',
    isbn: '',
    total_copies: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();
  const bookId = route.params?.id;

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await bookApi.getBookDetails(bookId);
      const bookData = response.data.book;
      
      // Find category key by value
      const categoryKey = Object.keys(categoryMap).find(
        key => categoryMap[key] === bookData.category
      ) || '';
      
      setForm({
        title: bookData.title,
        author: bookData.author,
        category: categoryKey,
        description: bookData.description || '',
        published_date: bookData.published_date,
        isbn: bookData.isbn,
        total_copies: String(bookData.total_copies),
      });
      
      setSelectedCategory(categoryKey);
    } catch (error) {
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się pobrać danych książki'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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

      await bookApi.editBook(bookId, bookData);
      Alert.alert('Sukces', 'Książka została zaktualizowana pomyślnie!');
      navigation.navigate('DetailsBookEmployee', { id: bookId});
    } catch (error) {
      console.error('Błąd przy aktualizacji książki:', error);
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się zaktualizować książki'
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Usuń książkę',
      'Czy na pewno chcesz usunąć tę książkę? Ta operacja jest nieodwracalna.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: handleDelete }
      ]
    );
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await bookApi.deleteBook(bookId);
      Alert.alert('Sukces', 'Książka została usunięta pomyślnie!');
      navigation.navigate('ManageBooks');
    } catch (error) {
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się usunąć książki'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigation.goBack();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edytuj książkę</Text>
          </View>
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edytuj książkę</Text>
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
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Opis"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(text) => handleChange('description', text)}
        />
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Zapisz zmiany</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.buttonText}>Usuń książkę</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditBook;