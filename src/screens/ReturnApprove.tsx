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

const ReturnApprove = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { rentalId } = route.params || {};
  const [loading, setLoading] = useState(false);

  const approveReturn = async () => {
    if (!rentalId) {
      Alert.alert('Błąd', 'Rental ID jest wymagane');
      return;
    }

    setLoading(true);
    try {
    await bookApi.approveReturn(rentalId)
      Alert.alert('Sukces', 'Zwrot został zatwierdzony!');
      navigation.goBack();
    } catch (error) {
      console.error('Błąd zatwierdzenia zwrotu:', error.response ? error.response.data : error.message);
      Alert.alert('Błąd', 'Nie udało się zatwierdzić zwrotu');
    } finally {
      setLoading(false);
    }
  };

  if (!rentalId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ReturnApprove</Text>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.errorText}>Brak Rental ID</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Wróć</Text>
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
            <Text style={styles.headerTitle}>ReturnApprove</Text>
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
        {/* Header z przyciskiem Wróć */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Zatwierdź Zwrot</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={approveReturn}>
            <Text style={styles.buttonText}>Zatwierdź zwrót</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50', // Changed from #1e88e5 to darker blue
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f7f1', // Changed from #f5f5f5 to paper-like color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50', // Changed to match safeArea
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4, // Added elevation for shadow on Android
  },
  headerTitle: {
    fontSize: 22, // Increased from 18
    fontWeight: 'bold',
    color: '#f9f7f1', // Changed from #fff to paper color
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added book-like font
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
    color: '#f9f7f1', // Changed from #fff to paper color
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2c3e50', // Changed from #1e88e5 to darker blue
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000', // Added shadow properties for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#f9f7f1', // Changed from #fff to paper color
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif', // Added consistent font
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
    color: '#922b21', // Changed from red to a more elegant dark red
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Added consistent font
  },
});

export default ReturnApprove;
