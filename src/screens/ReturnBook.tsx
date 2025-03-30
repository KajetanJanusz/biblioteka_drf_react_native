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
      Alert.alert('Success', 'Return request submitted!');
      navigation.goBack();
    } catch (error) {
        console.error('Return error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!notificationId) {
      Alert.alert('Error', 'Notification ID is missing');
      return;
    }
    
    setLoading(true);
    try {
      await bookApi.markAsRead(notificationId);
      Alert.alert('Success', 'Book marked as read!');
      navigation.goBack();
    } catch (error) {
        console.error('Mark as read error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to mark book as read');
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
      Alert.alert('Success', 'Rental extended for 7 days!');
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
            <Text style={styles.headerTitle}>Book Return</Text>
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
            <Text style={styles.headerTitle}>Book Return</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
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
          <Text style={styles.headerTitle}>Book Return</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={returnBook}>
            <Text style={styles.buttonText}>Zwróć książkę</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={markAsRead}>
            <Text style={styles.buttonText}>Przeczytane</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonThird} onPress={extendRental}>
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
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonThird: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: 'red',
  },
});

export default BookReturn;
