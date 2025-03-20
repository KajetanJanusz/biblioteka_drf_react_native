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
            <Text style={styles.headerTitle}>Book Details</Text>
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
            <Text style={styles.headerTitle}>Book Details</Text>
          </View>
          <Text style={styles.errorText}>Book not found</Text>
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
          <Text style={styles.headerTitle}>Book Details</Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Book Information Card */}
          <View style={styles.bookCard}>
            <View style={styles.bookImageContainer}>
              <View style={styles.bookImagePlaceholder}>
                <Text style={styles.bookImagePlaceholderText}>
                  {book.title.charAt(0)}
                </Text>
              </View>
            </View>

            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            
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
                    ? `${available_copies} of ${book.total_copies} Available` 
                    : 'Unavailable'}
                </Text>
              </View>
            </View>

            <View style={styles.bookDetailsContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.bookDescription}>{book.description}</Text>
              
              <Text style={styles.sectionTitle}>Publication Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Published:</Text>
                <Text style={styles.detailValue}>{formatDate(book.published_date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ISBN:</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            </View>

            {/* Add to Notifications Button (only if available) */}
            {can_add_notifications && (
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => Alert.alert('Notification', 'You will be notified when this book becomes available')}
              >
                <Text style={styles.notificationButtonText}>
                  Notify me when available
                </Text>
              </TouchableOpacity>
            )}

            {/* Borrow Book Button */}
            <TouchableOpacity 
              style={[
                styles.borrowButton,
                available_copies === 0 && styles.disabledButton
              ]}
              disabled={available_copies === 0}
              onPress={() => Alert.alert('Success', `You've borrowed "${book.title}"`)}
            >
              <Text style={styles.borrowButtonText}>
                {available_copies > 0 ? 'Borrow Book' : 'Currently Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Reviews ({opinions.length})</Text>
            
            {opinions.length > 0 ? (
              <FlatList
                data={opinions}
                renderItem={renderOpinionItem}
                keyExtractor={(item) => `opinion-${item.id}`}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  bookCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bookImagePlaceholder: {
    width: 120,
    height: 180,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookDetailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  bookDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notificationButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  notificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  borrowButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    borderRadius: 24,
  },
  borrowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  reviewsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  opinionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  opinionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starFilled: {
    color: '#ffc107',
    fontSize: 18,
    marginRight: 2,
  },
  starEmpty: {
    color: '#e0e0e0',
    fontSize: 18,
    marginRight: 2,
  },
  opinionDate: {
    fontSize: 14,
    color: '#999',
  },
  opinionComment: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default BookDetailsScreen;