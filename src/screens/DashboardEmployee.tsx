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
    return <Text style={styles.errorText}>Failed to load data</Text>;
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
        <Text style={styles.headerTitle}>Employee Dashboard</Text>
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
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('DashboardEmployee')}>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageBooks')}>
                <Text style={styles.menuItemText}>Manage Books</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageUsers')}>
                <Text style={styles.menuItemText}>Manage Users</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Logout')}>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome, Employee!</Text>
        
        <Text style={styles.sectionTitle}>📚 Currently Rented Books:</Text>
        {data.rented_books && data.rented_books.length > 0 ? (
          data.rented_books.map((item) => (
            <View key={item.id.toString()} style={styles.bookItem}>
              <Text style={styles.bookTitle}>{item.book_copy__book__title}</Text>
              <Text style={styles.bookUser}>Rented by: {item.user__username}</Text>
              <Text style={styles.bookDueDate}>Due: {formatDate(item.due_date)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No books currently rented</Text>
        )}

        <Text style={styles.sectionTitle}>👥 Customers:</Text>
        {data.customers && data.customers.length > 0 ? (
          data.customers.map((customer) => (
            <View key={customer.id.toString()} style={styles.customerItem}>
              <Text style={styles.customerName}>{customer.username}</Text>
              <Text style={styles.customerEmail}>{customer.email}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No customers</Text>
        )}

        <Text style={styles.sectionTitle}>📊 Statistics:</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.total_rentals}</Text>
            <Text style={styles.statLabel}>Total Rentals</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 Most Rented Books:</Text>
        {data.most_rented_books && data.most_rented_books.length > 0 ? (
          data.most_rented_books.map((book, index) => (
            <View key={index} style={styles.popularBookItem}>
              <Text style={styles.popularBookTitle}>{book.book_copy__book__title}</Text>
              <Text style={styles.popularBookCount}>Rented {book.rental_count} times</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No data available</Text>
        )}

        <Text style={styles.sectionTitle}>🔄 Returns to Approve:</Text>
        {data.returns_to_approve && data.returns_to_approve.length > 0 ? (
          data.returns_to_approve.map((item) => (
            <View key={item.id.toString()} style={styles.returnItem}>
              <Text style={styles.returnTitle}>{item.book_copy__book__title}</Text>
              <Text style={styles.returnUser}>Returned by: {item.user__username}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>No returns to approve</Text>
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
      paddingTop: Platform.OS === 'ios' ? 44 : 16,
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
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
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
  customerItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
  },
  popularBookItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  popularBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  popularBookCount: {
    fontSize: 14,
    color: '#666',
  },
  returnItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  returnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  returnUser: {
    fontSize: 14,
    color: '#666',
  },
});

export default DashboardEmployee;
