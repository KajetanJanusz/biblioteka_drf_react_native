import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { message: 'Wylogowano' } }],
      });
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Wylogowywanie...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 18,
    color: '#333',
  },
});

export default LogoutScreen;
