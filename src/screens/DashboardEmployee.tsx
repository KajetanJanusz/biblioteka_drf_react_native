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

const DashboardEmployee = () => {
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

        const response = await dashboardApi.getEmployeeDashboard();
        setData(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch dashboard data');
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
    return <Text style={styles.errorText}>Błąd ładowania danych</Text>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <Text style={styles.headerTitle}>Profil bibliotekarza</Text>
      </View>

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
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('DashboardEmployee')}>
                <Text style={styles.menuItemText}>Strona główna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageBooks')}>
                <Text style={styles.menuItemText}>Zarządzaj książkami</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageUsers')}>
                <Text style={styles.menuItemText}>Zarządzaj użytkownikami</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Logout')}>
                <Text style={styles.menuItemText}>Wyloguj się</Text>
              </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Witaj, Bibliotekarzu!</Text>
        
        <Text style={styles.sectionTitle}>📚 Aktualnie wypożyczone książki:</Text>
        {data.rented_books && data.rented_books.length > 0 ? (
          data.rented_books.map((item) => (
            <View key={item.id.toString()} style={styles.bookItem}>
              <Text style={styles.bookTitle}>{item.book_copy__book__title}</Text>
              <Text style={styles.bookUser}>Wypożyczone przez: {item.user__username}</Text>
              <Text style={styles.bookDueDate}>Do: {formatDate(item.due_date)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak aktualnie wypożyczonych książek</Text>
        )}

        <Text style={styles.sectionTitle}>👥 Użytkownicy:</Text>
        {data.customers && data.customers.length > 0 ? (
          data.customers.map((customer) => (
            <View key={customer.id.toString()} style={styles.customerItem}>
              <Text style={styles.customerName}>{customer.username}</Text>
              <Text style={styles.customerEmail}>{customer.email}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak użytkowników</Text>
        )}

        <Text style={styles.sectionTitle}>📊 Statystyki:</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.total_rentals}</Text>
            <Text style={styles.statLabel}>Suma wypożyczeń</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 Najczęściej wypożyczone książki:</Text>
        {data.most_rented_books && data.most_rented_books.length > 0 ? (
          data.most_rented_books.map((book, index) => (
            <View key={index} style={styles.popularBookItem}>
              <Text style={styles.popularBookTitle}>{book.book_copy__book__title}</Text>
              <Text style={styles.popularBookCount}>Wypożyczone {book.rental_count} razy</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak dostępnych danych</Text>
        )}

        <Text style={styles.sectionTitle}>🔄 Zwroty do zatwierdzenia:</Text>
        {data.returns_to_approve && data.returns_to_approve.length > 0 ? (
          data.returns_to_approve.map((item) => (
            <TouchableOpacity 
            key={item.id ? item.id.toString() : `rented-${index}`} 
            style={styles.bookItem}
            onPress={() => { console.log(item); navigation.navigate('ReturnApprove', { rentalId: item.id })}}
            >
              <View key={item.id.toString()} style={styles.returnItem}>
                <Text style={styles.returnTitle}>{item.book_copy__book__title}</Text>
                <Text style={styles.returnUser}>Zwracany przez: {item.user__username}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak zwrotów do zatwierdzenia</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#2c3e50', // Changed from #f5f5f5 to darker blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50', // Changed from #1e88e5 to darker blue
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4, // Added elevation for Android
  },
  headerTitle: {
    fontSize: 22, // Increased from 18
    fontWeight: 'bold',
    color: '#f9f7f1', // Changed from #fff to paper color
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
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
    backgroundColor: '#f9f7f1', // Changed from #fff to paper color
    borderRadius: 2, // Changed from 1
    marginVertical: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Changed opacity
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#f9f7f1', // Changed from #fff to paper color
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5, // Increased from 0.3
    shadowRadius: 8, // Increased from 5
    elevation: 10, // Increased from 5
  },
  menuHeader: {
    padding: 24, // Increased from 20
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Changed from 20
    backgroundColor: '#2c3e50', // Changed from #1e88e5 to darker blue
  },
  menuTitle: {
    fontSize: 22, // Increased from 20
    fontWeight: 'bold',
    color: '#f9f7f1', // Changed from #fff to paper color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  menuItem: {
    padding: 18, // Increased from 16
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0d5', // Changed from #f0f0f0 to a more paper-like color
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50', // Changed from #333 to darker blue
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f7f1', // Changed from inherited to paper-like color
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
    color: '#922b21', // Changed from #f44336 to a more elegant dark red
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added consistent font
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50', // Changed from #333 to darker blue
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50', // Changed from #333 to darker blue
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  list: {
    marginBottom: 8,
  },
  emptyList: {
    fontStyle: 'italic',
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    textAlign: 'center',
    padding: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added consistent font
  },
  // Book item styles
  bookItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2c3e50', // Changed from #1e88e5 to darker blue
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Added margin
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#2c3e50', // Changed from inherited to darker blue
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  bookStatus: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#2c3e50', // Changed from #1e88e5 to darker blue
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  bookDates: {
    fontSize: 12,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  bookUser: {
    fontSize: 14,
    color: '#7d6e56', // Changed from inherited to a more book-themed color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  bookDueDate: {
    fontSize: 12,
    color: '#7d6e56', // Changed from inherited to a more book-themed color
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // History item styles
  historyItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7f8c8d', // Changed from #9e9e9e to a more elegant color
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  historyAuthor: {
    fontSize: 14,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  historyDate: {
    fontSize: 12,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 8,
    textAlign: 'right', // Added alignment
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // Notification styles
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12', // Changed from #ff9800 to a more elegant color
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  notificationDate: {
    fontSize: 12,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 6, // Changed from 4
    textAlign: 'right', // Added alignment
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // Recommendation styles
  recommendationItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60', // Changed from #4caf50 to a more elegant color
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2c3e50', // Added specific color
    lineHeight: 20, // Added line height
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // Review styles
  reviewItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f1c40f', // Changed from #f44336 to a more elegant color
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  reviewRating: {
    fontSize: 14,
    marginVertical: 4, // Added vertical margin
  },
  reviewComment: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8, // Increased from 4
    color: '#7d6e56', // Changed from inherited to a more book-themed color
    lineHeight: 20, // Added line height
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  reviewDate: {
    fontSize: 12,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 8,
    textAlign: 'right', // Added alignment
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000', // Enhanced shadow properties
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22, // Increased from 20
    fontWeight: 'bold',
    color: '#2c3e50', // Changed from #1e88e5 to darker blue
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  statLabel: {
    fontSize: 13, // Increased from 12
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  // Badge styles
  badgeContainer: {
    marginBottom: 16,
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8, // Added top margin
  },
  badge: {
    backgroundColor: '#2c3e50', // Changed from #9c27b0 to darker blue
    color: '#f9f7f1', // Changed from #fff to paper color
    padding: 10, // Increased padding
    borderRadius: 20, // Changed from 16
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
    shadowColor: '#000', // Added shadow properties
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
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
    borderWidth: 1, // Added border
    borderColor: '#d1c7b7', // Added border color
    shadowColor: '#000', // Enhanced shadow properties
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  categoryCount: {
    fontSize: 12,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  customerItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  customerEmail: {
    fontSize: 14,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  popularBookItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  popularBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  popularBookCount: {
    fontSize: 14,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
  returnItem: {
    backgroundColor: '#fff',
    padding: 16, // Increased from 12
    marginBottom: 12, // Increased from 8
    borderRadius: 8,
  },
  returnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50', // Added specific color
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
  },
  returnUser: {
    fontSize: 14,
    color: '#7d6e56', // Changed from #666 to a more book-themed color
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
  },
});

export default DashboardEmployee;
