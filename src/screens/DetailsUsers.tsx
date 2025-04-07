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
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { userApi } from '../services/apiServices.ts';
import { useRoute, useNavigation } from '@react-navigation/native';

interface UserDetails {
  imię: string;
  nazwisko: string;
  adres_email: string;
  numer_telefonu: string;
}

const DetailUsersScreen = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    imię: '',
    nazwisko: '',
    adres_email: '',
    numer_telefonu: '',
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
        imię: response.data.first_name || '',
        nazwisko: response.data.last_name || '',
        adres_email: response.data.email || '',
        numer_telefonu: response.data.phone || '',
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
      Alert.alert('Sukces', 'Użytkownik edytowany pomyślnie');
      setEditing(false);
      fetchUserDetails();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Błąd aktualizacji użytkownika');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!userId) return;
    Alert.alert('Potwierdź usunięcie', 'Czy aby napewno chcesz usunąć użytkownika?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await userApi.deleteUser(userId.toString());
            Alert.alert('Usunięto', 'Użytkownik pomyślnie usunięty');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Błąd w usunięciu użyktkownika');
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
          <Text style={styles.headerTitle}>Szczegóły użytkownika</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.userCard}>
            <Text style={styles.sectionTitle}>Informacje o użytkowniku</Text>
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
                <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                  <Text style={styles.editButtonText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={deleteUser}>
                  <Text style={styles.deleteButtonText}>Usuń</Text>
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
    backgroundColor: '#2c3e50',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
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
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 28,
    color: '#f9f7f1',
    fontWeight: 'bold',
  },
  headerTitle: { 
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1',
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContainer: { 
    flex: 1 
  },
  userCard: { 
    backgroundColor: '#f9f7f1', 
    padding: 16, 
    borderRadius: 8, 
    shadowOpacity: 0.1 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  input: { 
    height: 50,
    borderWidth: 1,
    borderColor: '#d1c7b7',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  saveButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    elevation: 2,
  },
  saveButtonText: { 
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  editButton: { 
    backgroundColor: '#2c3e50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    elevation: 2,
  },
  editButtonText: { 
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  deleteButton: { 
    backgroundColor: '#FF3B30', 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    elevation: 2,
    top: 10,
  },
  deleteButtonText: { 
    color: '#f9f7f1',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
  
  export default DetailUsersScreen;