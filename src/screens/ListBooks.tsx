import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
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
      1: 'Science Fiction',
      2: 'Fantasy',
      3: 'History',
      4: 'Biography',
      5: 'Literature',
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

  const renderBookItem = ({ item }) => {
    const isAvailable = item.available_copies > 0;
    
    return (
      <TouchableOpacity 
        style={[
          styles.bookItem, 
          !isAvailable && styles.unavailableBook
        ]}
        onPress={() => {
          navigation.navigate('DetailsBook', { id: item.id });
        }}
      >
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <View style={[
            styles.availabilityBadge, 
            {backgroundColor: isAvailable ? '#4caf50' : '#f44336'}
          ]}>
            <Text style={styles.availabilityText}>
              {isAvailable ? `${item.available_copies} Available` : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.bookAuthor}>by {item.author}</Text>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{getCategoryName(item.category)}</Text>
        </View>
        
        <Text 
          style={styles.bookDescription}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Library Books</Text>
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
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Dashboard')}>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Login')}>
                <Text style={styles.menuItemText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Register')}>
                <Text style={styles.menuItemText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter Horizontal Scrollable */}
        <View>
          <Text style={styles.sectionTitle}>Categories:</Text>
          <FlatList
            horizontal
            data={[{ id: null, name: 'All' }, ...categories.map(id => ({ id, name: getCategoryName(id) }))]
            }
            keyExtractor={(item) => `category-${item.id || 'all'}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
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
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Book List */}
        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        ) : (
          <>
            <Text style={styles.resultsText}>
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
            </Text>
            <FlatList
              data={filteredBooks}
              renderItem={renderBookItem}
              keyExtractor={(item, index) => `book-${index}`}
              contentContainerStyle={styles.bookList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyList}>No books match your search criteria</Text>
              }
            />
          </>
        )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e88e5',
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
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
    backgroundColor: '#fff',
    borderRadius: 1,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sideMenu: {
    width: '70%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    padding: 20,
    backgroundColor: '#1e88e5',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    marginHorizontal: 16,
    color: '#333',
  },
  categoryList: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryItem: {
    backgroundColor: '#1e88e5',
    borderColor: '#1e88e5',
  },
  categoryItemText: {
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsText: {
    margin: 16,
    fontSize: 14,
    color: '#666',
  },
  bookList: {
    padding: 8,
  },
  bookItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
  },
  unavailableBook: {
    opacity: 0.7,
    borderLeftColor: '#f44336',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
  },
  bookDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    textAlign: 'center',
    padding: 32,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default BookListScreen;