import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.253.0.156:8000/api/';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(
          `${API_URL}token/refresh/`,
          { refresh: refreshToken }
        );
        
        await AsyncStorage.setItem('accessToken', response.data.access);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('token/', { username, password });
    
    await AsyncStorage.setItem('accessToken', response.data.access);
    await AsyncStorage.setItem('refreshToken', response.data.refresh);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  try {
    const response = await api.post('register/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userRole');
    return true;
  } catch (error) {
    throw error;
  }
};
