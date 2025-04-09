import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { bookApi } from '../services/apiServices.ts';
import { useNavigation } from '@react-navigation/native';

const BookListScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookApi.getBooks();
      setBooks(response.data.books);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to fetch books'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

  // Extract unique categories
  const categories = books.length > 0
    ? [...new Set(books.map(book => book.category))]
    : [];

  // Get category name (in a real app, you'd map category IDs to names)
  const getCategoryName = (categoryId) => {
    const categoryMap = {
      1: 'Fantastyka naukowa',
      2: 'Fantastyka',
      3: 'Historia',
      4: 'Biografia',
      5: 'Literatura',
      // Add more mappings as needed
    };
    return categoryMap[categoryId] || `Category ${categoryId}`;
  };

  // Filter books based on search and category
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderBookItem = (item) => {
    const isAvailable = item.available_copies > 0;
  
    return (
      <TouchableOpacity
        key={`book-${item.id}`}
        style={[
          styles.bookItem,
          !isAvailable && styles.unavailableBook
        ]}
        onPress={() => {
          navigation.navigate('DetailsBook', { id: item.id });
        }}
      >
        <Text style={styles.bookTitle}>{item.title}</Text>
  
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{getCategoryName(item.category)}</Text>
        </View>
  
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: isAvailable ? '#4caf50' : '#f44336' }
        ]}>
          <Text style={styles.availabilityText}>
            {isAvailable
              ? `${item.available_copies} ${
                  item.available_copies === 1
                    ? 'Dostępna'
                    : item.available_copies <= 4
                    ? 'Dostępne'
                    : 'Dostępnych'
                }`
              : 'Niedostępna'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category items horizontally
  const renderCategoryItems = () => {
    const categoryItems = [
      { id: null, name: 'Wszystkie' },
      ...categories.map(id => ({ id, name: getCategoryName(id) }))
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categoryItems.map(item => (
          <TouchableOpacity
            key={`category-${item.id || 'all'}`}
            style={[
              styles.categoryItem,
              selectedCategory === item.id && styles.selectedCategoryItem
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={[
              styles.categoryItemText,
              selectedCategory === item.id && styles.selectedCategoryText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Function to render the book grid
  const renderBookGrid = () => {
    return (
      <View style={styles.bookGrid}>
        {filteredBooks.map((item) => renderBookItem(item))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <View style={styles.menuIcon}>
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Książki</Text>
        </View>

        {/* Side Menu (when open) */}
        {menuOpen && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity 
              style={styles.menuOverlayBackground}
              onPress={toggleMenu}
            />
            <View style={styles.sideMenu}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
              </View>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('DashboardCustomer')}>
                <Text style={styles.menuItemText}>Strona główna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ListBooks')}>
                <Text style={styles.menuItemText}>Książki</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Logout')}>
                <Text style={styles.menuItemText}>Wyloguj się</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj książek po tytule lub autorze..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Main Content - Using ScrollView to make everything scroll together */}
        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {/* Category Filter section */}
            <Text style={styles.sectionTitle}>Kategorie:</Text>
            {renderCategoryItems()}

            {/* Results counter */}
            <Text style={styles.resultsText}>
              Znaleziono {filteredBooks.length} {''}
              {filteredBooks.length === 1
                ? 'książkę'
                : (filteredBooks.length >= 2 && filteredBooks.length <= 4)
                ? 'książki'
                : 'książek'}
            </Text>

            {/* Books display */}
            {filteredBooks.length > 0 ? (
              renderBookGrid()
            ) : (
              <Text style={styles.emptyList}>Brak wyników dla podanych kryteriów</Text>
            )}
          </ScrollView>
        )}
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
  scrollContainer: {
    flex: 1,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1',
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: 'space-around',
  },
  menuBar: {
    height: 3,
    width: 24,
    backgroundColor: '#f9f7f1',
    borderRadius: 2,
    marginVertical: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    flexDirection: 'row',
  },
  menuOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sideMenu: {
    width: '70%',
    backgroundColor: '#f9f7f1',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  menuHeader: {
    padding: 24,
    backgroundColor: '#2c3e50',
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  menuItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0d5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0d5',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    marginHorizontal: 16,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryItem: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  categoryItemText: {
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsText: {
    margin: 16,
    fontSize: 15,
    color: '#7d6e56',
    fontStyle: 'italic',
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  bookItem: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2c3e50',
    width: '46%',
    height: 160,
  },
  unavailableBook: {
    opacity: 0.7,
    borderLeftColor: '#922b21',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  availabilityBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 6,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#eee8dc',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1c7b7',
  },
  categoryText: {
    fontSize: 12,
    color: '#7d6e56',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    textAlign: 'center',
    padding: 40,
    fontSize: 16,
    color: '#7d6e56',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});

export default BookListScreen;