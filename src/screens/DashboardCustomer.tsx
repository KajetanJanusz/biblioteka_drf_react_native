import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.18.6:8000/api/dashboard/customer/';

const DashboardClientScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('Error', 'No access token found');
          navigation.navigate('Login');
          return;
        }

        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: 8 }
        });
        setData(response.data);
      } catch (error) {
        Alert.alert(
          'Error',
          error.response?.data?.detail || 'Failed to fetch dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />;
  }

  if (!data) {
    return <Text style={styles.errorText}>Failed to load data</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {data.username}!</Text>

      <Text style={styles.sectionTitle}>📚 Borrowed Books:</Text>
      <FlatList
        data={data.rented_books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.book_title}</Text>}
      />

      <Text style={styles.sectionTitle}>🔔 Notifications:</Text>
      <FlatList
        data={data.notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.message}</Text>}
      />
      <Text style={styles.sectionTitle}>🔔 rented_books:</Text>
      <FlatList
        data={data.ai_recommendations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.prop}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  item: { fontSize: 16, paddingVertical: 5 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
});

export default DashboardClientScreen;
