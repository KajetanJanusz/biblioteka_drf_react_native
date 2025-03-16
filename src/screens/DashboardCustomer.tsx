import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dashboardApi } from '../services/apiServices.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardClientScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('Error', 'No access token found');
          navigation.navigate('Login');
          return;
        }

        const response = await dashboardApi.getCustomerDashboard();
        setData(response.data);
      } catch (error) {
        Alert.alert(
          'Error',
          error.response?.data?.detail || 'Failed to fetch dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />;
  }

  if (!data) {
    return <Text style={styles.errorText}>Failed to load data</Text>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days remaining or overdue
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `${diffDays} days remaining`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome, {data.username}!</Text>
      
      <View style={styles.badgeContainer}>
        <Text style={styles.sectionTitle}>🏆 Achievements:</Text>
        <View style={styles.badgeList}>
          {data.badges.first_book && <Text style={styles.badge}>First Book</Text>}
          {data.badges.ten_books && <Text style={styles.badge}>10 Books</Text>}
          {data.badges.twenty_books && <Text style={styles.badge}>20 Books</Text>}
          {data.badges.hundred_books && <Text style={styles.badge}>100 Books</Text>}
          {data.badges.three_categories && <Text style={styles.badge}>3 Categories</Text>}
        </View>
      </View>

      <Text style={styles.sectionTitle}>📚 Currently Borrowed Books:</Text>
      {data.rented_books && data.rented_books.length > 0 ? (
        data.rented_books.map((item) => (
          <View key={item.id.toString()} style={styles.bookItem}>
            <View style={styles.bookHeader}>
              <Text style={styles.bookTitle}>{item.book_title}</Text>
              <Text style={styles.bookStatus}>{item.is_extended ? "Extended" : getDaysRemaining(item.due_date)}</Text>
            </View>
            <Text style={styles.bookAuthor}>by {item.book_author}</Text>
            <Text style={styles.bookDates}>
              Borrowed: {formatDate(item.rental_date)} | Due: {formatDate(item.due_date)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyList}>No books currently borrowed</Text>
      )}

      <Text style={styles.sectionTitle}>📘 Reading History:</Text>
      {data.rented_books_old && data.rented_books_old.length > 0 ? (
        data.rented_books_old.map((item) => (
          <View key={item.id.toString()} style={styles.historyItem}>
            <Text style={styles.historyTitle}>{item.book_title}</Text>
            <Text style={styles.historyAuthor}>by {item.book_author}</Text>
            <Text style={styles.historyDate}>Returned: {formatDate(item.return_date)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyList}>No reading history</Text>
      )}

      <Text style={styles.sectionTitle}>📊 Reading Stats:</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.all_my_rents}</Text>
          <Text style={styles.statLabel}>Total Books Read</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.average_user_rents.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg. User Reads</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>📚 My Reading Categories:</Text>
      <ScrollView horizontal style={styles.categoryList}>
        {data.books_in_categories && data.books_in_categories.length > 0 ? (
          data.books_in_categories.map((item) => (
            <View key={item.book_copy__book__category__name} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{item.book_copy__book__category__name}</Text>
              <Text style={styles.categoryCount}>{item.count} books</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No categories</Text>
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>🔔 Notifications:</Text>
      {data.notifications && data.notifications.length > 0 ? (
        data.notifications.map((item) => (
          <View key={item.id.toString()} style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.message}</Text>
            <Text style={styles.notificationDate}>{formatDate(item.created_at.split('T')[0])}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyList}>No notifications</Text>
      )}

      <Text style={styles.sectionTitle}>📚 Recommended for You:</Text>
      {data.ai_recommendations && data.ai_recommendations.length > 0 ? (
        data.ai_recommendations.map((item, index) => (
          <View key={index.toString()} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyList}>No recommendations</Text>
      )}

      <Text style={styles.sectionTitle}>⭐ My Book Reviews:</Text>
      {data.opinions && data.opinions.length > 0 ? (
        data.opinions.map((item) => (
          <View key={item.id.toString()} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>{item.book_title}</Text>
              <Text style={styles.reviewRating}>
                {Array(item.rate).fill('⭐').join('')}
              </Text>
            </View>
            <Text style={styles.reviewComment}>"{item.comment}"</Text>
            <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyList}>No reviews yet</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
    color: '#f44336',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  list: {
    marginBottom: 8,
  },
  emptyList: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 8,
  },
  // Book item styles
  bookItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  bookStatus: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#1e88e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookDates: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  // History item styles
  historyItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9e9e9e',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  // Notification styles
  notificationItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  notificationText: {
    fontSize: 14,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Recommendation styles
  recommendationItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  recommendationText: {
    fontSize: 14,
  },
  // Review styles
  reviewItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Badge styles
  badgeContainer: {
    marginBottom: 16,
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#9c27b0',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  // Category styles
  categoryList: {
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default DashboardClientScreen;
