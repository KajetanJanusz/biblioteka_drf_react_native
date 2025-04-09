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
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dashboardApi } from '../services/apiServices.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_WIDTH = Dimensions.get('window').width * 0.7;

const DashboardClientScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    outputRange: [0, 0.6],
  });

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const navigateTo = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2c3e50" style={styles.loader} />;
  }

  if (!data) {
    return <Text style={styles.emptyList}>Błąd ładowania danych</Text>;
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
    <View style={styles.safeArea}>
      {/* Hamburger Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.menuIcon}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil czytelnika</Text>
      </View>

      {/* Overlay to close menu when tapped */}
      {menuOpen && (
        <TouchableOpacity
          style={[styles.menuOverlay, { opacity: overlayOpacity }]}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <View style={styles.menuOverlayBackground} />
        </TouchableOpacity>
      )}

      {/* Slide-out Menu */}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuTranslate }] }]}>
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
      </Animated.View>

      {/* Main Content with Pull-to-Refresh */}
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2c3e50']}
            tintColor="#2c3e50"
            title="Odświeżanie..."
            titleColor="#7d6e56"
          />
        }
      >
        <Text style={styles.title}>Witaj, {data.username}!</Text>
        
        <View style={styles.badgeContainer}>
          <Text style={styles.sectionTitle}>🏆 Osiągnięcia:</Text>
          <View style={styles.badgeList}>
            {data.badges?.first_book && <Text style={styles.badge}>Pierwsza książka</Text>}
            {data.badges?.ten_books && <Text style={styles.badge}>10 Książek</Text>}
            {data.badges?.twenty_books && <Text style={styles.badge}>20 Książek</Text>}
            {data.badges?.hundred_books && <Text style={styles.badge}>100 Książek</Text>}
            {data.badges?.three_categories && <Text style={styles.badge}>3 Kategorie</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 Aktualnie wypożyczone książki:</Text>
        {data.rented_books && data.rented_books.length > 0 ? (
          data.rented_books.map((item, index) => (
            <TouchableOpacity 
            key={item.id ? item.id.toString() : `rented-${index}`} 
            style={styles.bookItem}
            onPress={() => { console.log(item); navigation.navigate('ReturnBook', { rentalId: item.rentalId, notificationId: item.notificationId })}}
            >
              <View style={styles.bookHeader}>
                <Text style={styles.bookTitle}>{item.book_title}</Text>
              </View>
              <Text style={styles.bookAuthor}>{item.book_author}</Text>
              <View style={[
                styles.availabilityBadge, 
                {backgroundColor: item.is_extended ? '#7f8c8d' : '#2c3e50'}
              ]}>
                <Text style={styles.availabilityText}>
                  {item.is_extended ? "Przedłużony" : getDaysRemaining(item.due_date)}
                </Text>
              </View>
              <Text style={styles.bookDates}>
                Wypożyczone od: {formatDate(item.rental_date)} | Do: {formatDate(item.due_date)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak aktualnie wypożyczonych książek</Text>
        )}

        <Text style={styles.sectionTitle}>📘 Historia wypożyczania:</Text>
        {data.rented_books_old && data.rented_books_old.length > 0 ? (
          data.rented_books_old.map((item, index) => (
            <View key={item.id ? item.id.toString() : `history-${index}`} style={[styles.bookItem, styles.historyItem]}>
              <Text style={styles.bookTitle}>{item.book_title}</Text>
              <Text style={styles.bookAuthor}>{item.book_author}</Text>
              <Text style={styles.historyDate}>Zwrócone: {formatDate(item.return_date)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak historii wypożyczania</Text>
        )}

        <Text style={styles.sectionTitle}>📊 Statystki:</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.all_my_rents || 0}</Text>
            <Text style={styles.statLabel}>Suma przeczytanych książek</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(data.average_user_rents || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Śr. wypożyczania</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📚 Moje ulubione kategorie:</Text>
        <ScrollView horizontal style={styles.categoryList}>
          {data.books_in_categories && data.books_in_categories.length > 0 ? (
            data.books_in_categories.map((item, index) => (
              <View key={`category-${index}`} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{item.book_copy__book__category__name}</Text>
                <Text style={styles.categoryCount}>{item.count} książki</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyList}>Brak ulubionych kategorii</Text>
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>🔔 Powiadomienia:</Text>
        {data.notifications && data.notifications.length > 0 ? (
          data.notifications.map((item, index) => (
            <View key={item.id ? item.id.toString() : `notification-${index}`} style={styles.notificationItem}>
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={styles.notificationDate}>{formatDate(item.created_at?.split('T')[0])}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak powiadomień</Text>
        )}

        <Text style={styles.sectionTitle}>📚 Polecane:</Text>
        {data.ai_recommendations && data.ai_recommendations.length > 0 ? (
          data.ai_recommendations.map((item, index) => (
            <View key={`recommendation-${index}`} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak polecanych</Text>
        )}

        <Text style={styles.sectionTitle}>⭐ Moje oceny książek:</Text>
        {data.opinions && data.opinions.length > 0 ? (
          data.opinions.map((item, index) => (
            <View key={item.id ? item.id.toString() : `review-${index}`} style={styles.reviewItem}>
              <View style={styles.bookHeader}>
                <Text style={styles.bookTitle}>{item.book_title}</Text>
              </View>
              <Text style={styles.reviewRating}>
                {Array(item.rate).fill('⭐').join('')}
              </Text>
              <Text style={styles.reviewComment}>"{item.comment}"</Text>
              <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyList}>Brak ocen</Text>
        )}
      </ScrollView>
    </View>
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
    padding: 16,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2,
  },
  menuOverlayBackground: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#f9f7f1',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  menuHeader: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    backgroundColor: '#2c3e50',
    color: '#f9f7f1',
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  emptyList: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#7d6e56',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bookItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2c3e50',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 8,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#7d6e56',
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  bookDates: {
    fontSize: 12,
    color: '#7d6e56',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  historyItem: {
    borderLeftColor: '#7f8c8d',
  },
  historyDate: {
    fontSize: 12,
    color: '#7d6e56',
    marginTop: 8,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statLabel: {
    fontSize: 13,
    color: '#7d6e56',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1c7b7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  categoryCount: {
    fontSize: 12,
    color: '#7d6e56',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  notificationText: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  notificationDate: {
    fontSize: 12,
    color: '#7d6e56',
    marginTop: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  recommendationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  recommendationText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f1c40f',
  },
  reviewRating: {
    fontSize: 14,
    marginVertical: 4,
  },
  reviewComment: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    color: '#7d6e56',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  reviewDate: {
    fontSize: 12,
    color: '#7d6e56',
    marginTop: 8,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
});

export default DashboardClientScreen;