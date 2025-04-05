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

const ManageUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

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
      <Text style={styles.phone}>{item.phone || 'No phone available'}</Text>
      <Text style={[styles.status, item.is_active ? styles.active : styles.inactive]}>
        {item.is_active ? 'Active' : 'Inactive'}
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
          <Text style={styles.headerTitle}>User Management</Text>
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
            </View>
          </View>
        )}
          <View style={styles.header}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddUser')}>
            <Text style={styles.addButtonText}>+ Add User</Text>
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
          />
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
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  userList: {
    padding: 16,
  },
  userItem: {
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
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
});

export default ManageUsersScreen;
