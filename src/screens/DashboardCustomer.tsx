import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dashboardApi } from '../services/apiServices.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_WIDTH = Dimensions.get('window').width * 0.7;

const DashboardClientScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setMenuOpen(!menuOpen);
  };
  
  const menuTranslate = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-MENU_WIDTH, 0],
  });
  
  const overlayOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

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
        navigation.navigate('DashboardEmployee');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigation]);

  const navigateTo = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

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
    <View style={styles.mainContainer}>
      {/* Hamburger Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.menuIcon}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Library Dashboard</Text>
      </View>

      {/* Overlay to close menu when tapped */}
      {menuOpen && (
        <TouchableOpacity
          style={[styles.overlay, { opacity: overlayOpacity }]}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Slide-out Menu */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuTranslate }] }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('DashboardCustomer')}>
          <Text style={styles.menuItemText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ListBooks')}>
          <Text style={styles.menuItemText}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Logout')}>
          <Text style={styles.menuItemText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome, {data.username}!</Text>
        
        <View style={styles.badgeContainer}>
          <Text style={styles.sectionTitle}>🏆 Achievements:</Text>
          <View style={styles.badgeList}>
            {data.badges?.first_book && <Text style={styles.badge}>First Book</Text>}
            {data.badges?.ten_books && <Text style={styles.badge}>10 Books</Text>}
            {data.badges?.twenty_books && <Text style={styles.badge}>20 Books</Text>}
            {data.badges?.hundred_books && <Text style={styles.badge}>100 Books</Text>}
            {data.badges?.three_categories && <Text style={styles.badge}>3 Categories</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 Currently Borrowed Books:</Text>
        {data.rented_books && data.rented_books.length > 0 ? (
          data.rented_books.map((item, index) => (
            <TouchableOpacity 
            key={item.id ? item.id.toString() : `rented-${index}`} 
            style={styles.bookItem}
            onPress={() => { console.log(item); navigation.navigate('ReturnBook', { rentalId: item.rentalId, notificationId: item.notificationId })}}
            >
            <View >
              <View style={styles.bookHeader}>
                <Text style={styles.bookTitle}>{item.book_title}</Text>
                <Text style={styles.bookStatus}>{item.is_extended ? "Extended" : getDaysRemaining(item.due_date)}</Text>
              </View>
              <Text style={styles.bookAuthor}>by {item.book_author}</Text>
              <Text style={styles.bookDates}>
                Borrowed: {formatDate(item.rental_date)} | Due: {formatDate(item.due_date)}
              </Text>
            </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyList}>No books currently borrowed</Text>
        )}

        <Text style={styles.sectionTitle}>📘 Reading History:</Text>
        {data.rented_books_old && data.rented_books_old.length > 0 ? (
          data.rented_books_old.map((item, index) => (
            <View key={item.id ? item.id.toString() : `history-${index}`} style={styles.historyItem}>
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
            <Text style={styles.statValue}>{data.all_my_rents || 0}</Text>
            <Text style={styles.statLabel}>Total Books Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(data.average_user_rents || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg. User Reads</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 My Reading Categories:</Text>
        <ScrollView horizontal style={styles.categoryList}>
          {data.books_in_categories && data.books_in_categories.length > 0 ? (
            data.books_in_categories.map((item, index) => (
              <View key={`category-${index}`} style={styles.categoryItem}>
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
          data.notifications.map((item, index) => (
            <View key={item.id ? item.id.toString() : `notification-${index}`} style={styles.notificationItem}>
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={styles.notificationDate}>{formatDate(item.created_at?.split('T')[0])}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No notifications</Text>
        )}

        <Text style={styles.sectionTitle}>📚 Recommended for You:</Text>
        {data.ai_recommendations && data.ai_recommendations.length > 0 ? (
          data.ai_recommendations.map((item, index) => (
            <View key={`recommendation-${index}`} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No recommendations</Text>
        )}

        <Text style={styles.sectionTitle}>⭐ My Book Reviews:</Text>
        {data.opinions && data.opinions.length > 0 ? (
          data.opinions.map((item, index) => (
            <View key={item.id ? item.id.toString() : `review-${index}`} style={styles.reviewItem}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
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
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
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
  badgeContainer: {
    marginBottom: 16,
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#1e88e5',
    color: '#fff',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  emptyList: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 8,
  },
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
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#1e88e5',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookDates: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
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
    color: '#888',
    marginTop: 8,
  },
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
  categoryList: {
    flexDirection: 'row',
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
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
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
  reviewItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    color: '#555',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default DashboardClientScreen;