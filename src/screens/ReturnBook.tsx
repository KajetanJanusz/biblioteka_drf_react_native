import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookApi } from '../services/apiServices';

const BookReturn = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { rentalId, notificationId } = route.params || {};
  const [loading, setLoading] = useState(false);

  const returnBook = async () => {
    if (!rentalId) {
      Alert.alert('Error', 'Rental ID is missing');
      return;
    }
    
    setLoading(true);
    try {
      await bookApi.returnBook(rentalId);
      Alert.alert('Sukces', 'Zwrot wysłany!');
      navigation.goBack();
    } catch (error) {
        console.error('Return error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const extendRental = async () => {
    if (!rentalId) {
      Alert.alert('Error', 'Rental ID is missing');
      return;
    }

    setLoading(true);
    try {
      await bookApi.extendRental(rentalId);
      Alert.alert('Sukces', 'Wypożyczenie przedłużone o 7 dni!');
    } catch (error) {
        console.error('Extend rental error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to extend rental');
    } finally {
      setLoading(false);
    }
  };

  if (!rentalId || !notificationId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Powrót</Text>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.errorText}>
              {!rentalId ? 'Rental ID is missing' : 'Notification ID is missing'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Powrót</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2c3e50" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Powrót</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={returnBook}>
            <Text style={styles.buttonText}>Zwróć książkę</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonExtend} onPress={extendRental}>
            <Text style={styles.buttonText}>Przedłuż o 7 dni</Text>
          </TouchableOpacity>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f7f1',
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#f9f7f1',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonExtend: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#f9f7f1',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#922b21',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
});

export default BookReturn;