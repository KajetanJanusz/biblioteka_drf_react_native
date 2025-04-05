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
  ScrollView,
} from 'react-native';
import { userApi } from '../services/apiServices.ts';
import { useRoute, useNavigation } from '@react-navigation/native';

interface UserDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const DetailUsersScreen = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);

  const route = useRoute();
  const navigation = useNavigation();
  const userId = route.params?.user_id;

  useEffect(() => {
    if (userId) fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserDetails(userId);
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

  const handleChange = (key: keyof UserDetails, value: string) => {
    setUserDetails((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      await userApi.editUser(userId, userDetails);
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
    if (!userId) return;
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await userApi.deleteUser(userId.toString());
            Alert.alert('Deleted', 'User has been deleted successfully');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to delete user');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
                value={userDetails[key as keyof UserDetails]}
                onChangeText={(text) => handleChange(key as keyof UserDetails, text)}
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
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  backButtonText: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { flex: 1 },
  userCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, shadowOpacity: 0.1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 10, paddingVertical: 8 },
  saveButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 10 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  editButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 10 },
  editButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, marginTop: 10 },
  deleteButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  loader: { marginTop: 20 },
});
  
  export default DetailUsersScreen;