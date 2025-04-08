import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { bookApi } from '../services/apiServices.ts';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const [categories, setCategories] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();
  const bookId = route.params?.id;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchCategories();
        await fetchBookDetails();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookId]);

  const fetchCategories = async () => {
    try {
      const response = await bookApi.getCategories();
      console.log("Categories response:", response.data);
      setCategories(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert(
        'Błąd',
        'Nie udało się pobrać kategorii. Spróbuj ponownie później.'
      );
      throw error;
    }
  };

  const fetchBookDetails = async () => {
    try {
      const response = await bookApi.getBookDetails(bookId);
      console.log("Book details response:", response.data);
      
      const bookData = response.data.book;
      
      // Handle the category based on actual response structure
      // This is the critical part that needs fixing
      let categoryId = '';
      
      // Check different possible structures for the category in the response
      if (bookData.category && typeof bookData.category === 'object' && bookData.category.id) {
        // If category is an object with an id field
        categoryId = bookData.category.id.toString();
      } else if (bookData.category && typeof bookData.category === 'number') {
        // If category is just a number
        categoryId = bookData.category.toString();
      } else if (typeof bookData.category === 'string' && !isNaN(parseInt(bookData.category))) {
        // If category is a string that can be parsed as a number
        categoryId = bookData.category;
      } else {
        // If category is a string name, try to find matching id
        const matchingCategory = categories.find(cat => cat.name === bookData.category);
        if (matchingCategory) {
          categoryId = matchingCategory.id.toString();
        }
      }
      
      setForm({
        title: bookData.title || '',
        author: bookData.author || '',
        category: categoryId,
        description: bookData.description || '',
        published_date: bookData.published_date || '',
        isbn: bookData.isbn || '',
        total_copies: bookData.total_copies ? String(bookData.total_copies) : '',
      });
      
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('Error fetching book details:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Błąd',
        error.response?.data?.detail || 'Nie udało się pobrać danych książki'
      );
      navigation.goBack();
      throw error;
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

      console.log("Submitting book data:", bookData);
      await bookApi.editBook(bookId, bookData);
      Alert.alert('Sukces', 'Książka została zaktualizowana pomyślnie!');
      navigation.navigate('DetailsBookEmployee', { id: bookId});
    } catch (error) {
      console.error('Błąd przy aktualizacji książki:', error);
      console.error('Error response:', error.response?.data);
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
          {categories.map((category) => (
            <Picker.Item 
              key={category.id.toString()} 
              label={category.name} 
              value={category.id.toString()} 
            />
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1',
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
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  dateInput: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#922b21',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditBook;