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
} from 'react-native';
import { userApi } from '../services/apiServices.ts';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

const ManageUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Fetch Users Error:", error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to fetch users'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const navigateTo = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        navigation.navigate('DetailsUsers', { user_id: item.id });
      }}
    >
      <View style={styles.userHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <Text style={styles.fullName}>{`${item.first_name} ${item.last_name}`}</Text>
      <Text style={styles.phone}>{item.phone || 'Brak numeru telefonu'}</Text>
      <Text style={[styles.status, item.is_active ? styles.active : styles.inactive]}>
        {item.is_active ? 'Aktywny' : 'Nieaktywny'}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Zarządzanie użytkownikami</Text>
        </View>

        {/* Side Menu */}
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
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('DashboardEmployee')}>
                <Text style={styles.menuItemText}>Strona główna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageBooks')}>
                <Text style={styles.menuItemText}>Zarządzanie książkami</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ManageUsers')}>
                <Text style={styles.menuItemText}>Zarządzanie użytkownikami</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Logout')}>
                <Text style={styles.menuItemText}>Wyloguj się</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
          <View style={styles.header}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddUser')}>
            <Text style={styles.addButtonText}>+ Dodaj użytkownika</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => `user-${item.id}`}
            contentContainerStyle={styles.userList}
            refreshing={loading}
            onRefresh={fetchUsers}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50', // Ciemniejszy niebieski - bardziej elegancki
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
  addButton: {
    backgroundColor: '#2c3e50', // Ciemniejszy niebieski spójny z safeArea i header
    paddingVertical: 10, // Większy padding dla wygodniejszego kliknięcia
    paddingHorizontal: 16,
    borderRadius: 20, // Zaokrąglone rogi spójne z categoryItem
    shadowColor: '#000', // Delikatny cień
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Lekki efekt podniesienia
  },
  addButtonText: {
    fontSize: 16, // Większa czcionka dla lepszej czytelności
    fontWeight: 'bold',
    color: '#f9f7f1', // Kolor przypominający papier, kontrastujący z ciemnym tłem
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Spójna czcionka
  },
  userList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    flex: 1,
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
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  fullName: {
    fontSize: 14,
    color: '#444',
  },
  phone: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  active: {
    color: 'green',
  },
  inactive: {
    color: 'red',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.6)', // Ciemniejsze tło dla lepszego kontrastu
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
    borderBottomColor: '#e8e0d5', // Subtelna linia oddzielająca
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
});

export default ManageUsersScreen;
