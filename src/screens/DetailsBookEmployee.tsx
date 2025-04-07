import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { bookApi } from '../services/apiServices.ts';
import { useRoute, useNavigation } from '@react-navigation/native';

// Interface for book data
interface Book {
  title: string;
  author: string;
  category: string;
  description: string;
  published_date: string;
  isbn: string;
  total_copies: number;
}

// Interface for opinion data
interface Opinion {
  id: number;
  book_title: string;
  rate: number;
  comment: string;
  created_at: string;
}

// Interface for the complete book details response
interface BookDetailsResponse {
  book: Book;
  opinions: Opinion[];
  can_add_notifications: boolean;
  available_copies: number;
}

const BookDetailsScreen = () => {
  const [bookDetails, setBookDetails] = useState<BookDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const bookId = route.params?.id;

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      // Using the bookApi.getBookDetails with the correct parameter structure
      const response = await bookApi.getBookDetails(bookId);
      setBookDetails(response.data);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to fetch book details'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (book) =>
    book?.isbn
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
      : 'https://via.placeholder.com/150x220?text=No+Cover';

  // Dodaj nową funkcję do wypożyczania książki
const borrowBook = async () => {
  try {
    // Pokaż wskaźnik ładowania
    setLoading(true);
    
    // Wywołaj odpowiednią metodę z API
    await bookApi.borrowBook(bookId);
    
    // Pokaż powiadomienie o sukcesie
    Alert.alert('Success', `You've borrowed "${book.title}"`);
    
    // Odśwież dane książki, aby pokazać zaktualizowaną liczbę dostępnych egzemplarzy
    fetchBookDetails();
    
  } catch (error) {
    // Obsłuż błędy
    Alert.alert(
      'Error',
      error.response?.data?.detail || 'Failed to borrow the book'
    );
  } finally {
    // Zakończ ładowanie
    setLoading(false);
  }
};

  // Function to render the star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </Text>
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Render a single opinion item
  const renderOpinionItem = ({ item }) => (
    <View style={styles.opinionItem}>
      <View style={styles.opinionHeader}>
        {renderStarRating(item.rate)}
        <Text style={styles.opinionDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.opinionComment}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Szczegóły książki</Text>
          </View>
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bookDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Szczegóły książki</Text>
          </View>
          <Text style={styles.errorText}>Książka nieznaleziona</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { book, opinions, available_copies, can_add_notifications } = bookDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Szczegóły książki</Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Book Information Card */}
          <View style={styles.bookCard}>
            <View style={styles.bookImageContainer}>
              <View style={styles.bookImagePlaceholder}>
              <Image
                source={{ uri: getCoverUrl(book) }}
                style={styles.bookImage}
                resizeMode="cover"
              />
              </View>
            </View>

            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}> {book.author}</Text>
            
            <View style={styles.bookMetaContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{book.category}</Text>
              </View>
              
              <View style={[
                styles.availabilityBadge,
                {backgroundColor: available_copies > 0 ? '#4caf50' : '#f44336'}
              ]}>
                <Text style={styles.availabilityText}>
                {available_copies > 0 
                  ? `${available_copies} z ${book.total_copies} ${
                      available_copies === 1 
                        ? 'Dostępna' 
                        : available_copies >= 2 && available_copies <= 4 
                        ? 'Dostępne' 
                        : 'Dostępnych'
                    }`
                  : 'Niedostępna'}
                </Text>
              </View>
            </View>

            <View style={styles.bookDetailsContainer}>
              <Text style={styles.sectionTitle}>Opis</Text>
              <Text style={styles.bookDescription}>{book.description}</Text>
              
              <Text style={styles.sectionTitle}>Szczegóły publikacji</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Data wydania:</Text>
                <Text style={styles.detailValue}>{formatDate(book.published_date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ISBN:</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            </View>

            {/* Add to Notifications Button (only if available) */}
            {/* {can_add_notifications && (
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => Alert.alert('Powiadomienie', 'Zostaniesz powiadomiony, gdy książka będzie dostępna')}
              >
                <Text style={styles.notificationButtonText}>
                  Powiadom mnie, gdy będzie dostępna
                </Text>
              </TouchableOpacity>
            )} */}

            {/* Borrow Book Button */}
            {/* <TouchableOpacity 
              style={[
                styles.borrowButton,
                available_copies === 0 && styles.disabledButton
              ]}
              disabled={available_copies === 0}
              onPress={borrowBook} // Zmiana tutaj - używamy nowej funkcji
            >
              <Text style={styles.borrowButtonText}>
                {available_copies > 0 ? 'Wypożycz książkę' : 'Aktualnie niedostępna'}
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity 
              style={styles.borrowButton}
              onPress={() => navigation.navigate('EditBook', { id: bookId })}
            >
              <Text style={styles.borrowButtonText}>Edytuj książkę</Text>
            </TouchableOpacity>


          </View>
          

          {/* Reviews Section */}
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Opinie ({opinions.length})</Text>
            
            {opinions.length > 0 ? (
              <FlatList
                data={opinions}
                renderItem={renderOpinionItem}
                keyExtractor={(item, index) => `opinion-${item.id || index}`}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noReviewsText}>Brak opinii</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50', // Ciemniejszy niebieski - spójny z listą książek
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f7f1', // Kolor przypominający papier - nawiązanie do książek
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50', // Spójny z safeArea
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1', // Kolor papieru dla kontrastu
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Czcionka kojarząca się z książkami
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
  scrollContainer: {
    flex: 1,
  },
  bookCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#2c3e50',
  },
  bookImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bookImagePlaceholder: {
    width: 140,
    height: 200,
    backgroundColor: '#eee8dc', // Papierowy odcień dla okładki
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1c7b7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bookImagePlaceholderText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bookAuthor: {
    fontSize: 18,
    color: '#7d6e56', // Ciemniejszy odcień brązu
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bookMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  categoryBadge: {
    backgroundColor: '#eee8dc', // Jasny papierowy kolor
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    minWidth: 100,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#7d6e56',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  availabilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  bookDetailsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 14,
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    borderBottomWidth: 1,
    borderBottomColor: '#eee8dc',
    paddingBottom: 8,
  },
  bookDescription: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 24,
    marginBottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  userManagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 10,
  },
  editUserButton: {
    backgroundColor: '#3c6382', // Bardziej stonowany niebieski
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteUserButton: {
    backgroundColor: '#922b21', // Ciemniejszy czerwony
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // actionButtonText: {
  //   color: 'white',
  //   fontWeight: 'bold',
  //   fontSize: 14,
  //   fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  // },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece3',
  },
  detailLabel: {
    fontSize: 16,
    color: '#7d6e56',
    width: 100,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  detailValue: {
    fontSize: 16,
    color: '#4a4a4a',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  notificationButton: {
    backgroundColor: '#d68438', // Cieplejszy odcień pomarańczowego
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  borrowButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  borrowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
    opacity: 0.8,
  },
  reviewsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#d68438', // Kolor dla sekcji recenzji
  },
  opinionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece3',
    paddingVertical: 16,
  },
  opinionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starFilled: {
    color: '#f39c12', // Cieplejszy kolor złoty dla gwiazdek
    fontSize: 20,
    marginRight: 3,
  },
  starEmpty: {
    color: '#e0e0e0',
    fontSize: 20,
    marginRight: 3,
  },
  opinionDate: {
    fontSize: 14,
    color: '#7d6e56',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  opinionComment: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#7d6e56',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#922b21',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
});

export default BookDetailsScreen;