import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const AddUserScreen = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
  });

  const navigation = useNavigation();
  const goBack = () => navigation.goBack();

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const userApi = axios.create({
    baseURL: 'http://localhost:8000/api/', // pełny URL API
  });

  const handleSubmit = async () => {
    try {
      // Wywołanie POST na endpoint 'users/add' z danymi
      await userApi.post('users/add', form);
      Alert.alert('Success', 'User added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Create User Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create user'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New User</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          value={form.first_name}
          onChangeText={(text) => handleChange('first_name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          value={form.last_name}
          onChangeText={(text) => handleChange('last_name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save User</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#1e88e5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddUserScreen;

//KOD Z INNYM RODZAJEM POŁACZENIA Z API I ODWOŁANIA DO NIEGO

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   Platform,
//   StatusBar,
// } from 'react-native';
// import { userApi } from '../services/apiServices.ts';
// import { useNavigation } from '@react-navigation/native';

// const AddUserScreen = () => {
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     first_name: '',
//     last_name: '',
//     phone: '',
//     is_active: true,
//   });

//   const navigation = useNavigation();
//   const goBack = () => navigation.goBack();

//   const handleChange = (name, value) => {
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async () => {
//     try {
//       await userApi.addUser(form);
//       Alert.alert('Success', 'User added successfully');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Create User Error:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.detail || 'Failed to create user'
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//         <TouchableOpacity onPress={goBack} style={styles.backButton}>
//             <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title}>Add New User</Text>
//         </View>
//         <TextInput
//           style={styles.input}
//           placeholder="Username"
//           placeholderTextColor="#666"
//           value={form.username}
//           onChangeText={(text) => handleChange('username', text)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="First Name"
//           placeholderTextColor="#666"
//           value={form.first_name}
//           onChangeText={(text) => handleChange('first_name', text)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Last Name"
//           placeholderTextColor="#666"
//           value={form.last_name}
//           onChangeText={(text) => handleChange('last_name', text)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           placeholderTextColor="#666"
//           keyboardType="email-address"
//           value={form.email}
//           onChangeText={(text) => handleChange('email', text)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Phone"
//           placeholderTextColor="#666"
//           keyboardType="phone-pad"
//           value={form.phone}
//           onChangeText={(text) => handleChange('phone', text)}
//         />
//         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//           <Text style={styles.submitButtonText}>Save User</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#1e88e5',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1e88e5',
//     paddingTop: Platform.OS === 'ios' ? 0 : 16,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 16,
//   },
//   input: {
//     backgroundColor: '#fff',
//     padding: 12,
//     marginBottom: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   submitButton: {
//     backgroundColor: '#1e88e5',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   backButtonText: {
//     fontSize: 24,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default AddUserScreen;