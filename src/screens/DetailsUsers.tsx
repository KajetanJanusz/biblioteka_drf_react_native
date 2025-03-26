import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { userApi } from '../services/apiServices.ts';
import { useRoute, useNavigation } from '@react-navigation/native';

const DetailUsersScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const route = useRoute();
  const navigation = useNavigation();
  const userId = route.params?.user_id;

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserDetails(userId);
      setUser(response.data);
      setUserDetails({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setUserDetails({ ...userDetails, [key]: value });
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      await userApi.updateUser(userId, userDetails);
      Alert.alert('Success', 'User details updated successfully');
      setEditing(false);
      fetchUserDetails();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userApi.deleteUser(userId);
              Alert.alert('Deleted', 'User has been deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to delete user');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const goBack = () => navigation.goBack();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.userCard}>
            <Text style={styles.sectionTitle}>User Information</Text>
            {Object.keys(userDetails).map((key) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={key.replace('_', ' ')}
                placeholderTextColor="#666"
                value={userDetails[key]}
                onChangeText={(text) => handleChange(key, text)}
                editable={editing}
              />
            ))}
            {editing ? (
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={deleteUser}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </>
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
    userCard: {
      backgroundColor: '#fff',
      margin: 16,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 12,
      backgroundColor: '#fff',
    },
    editButton: {
      backgroundColor: '#ff9800',
      paddingVertical: 12,
      borderRadius: 8,
    },
    editButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: '#4caf50',
      paddingVertical: 12,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
      },
      deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
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
  
  export default DetailUsersScreen;