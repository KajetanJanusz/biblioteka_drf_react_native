// src/api/apiServices.ts
import { api } from '../services/authService';

// User related API calls
export const userApi = {
  getUsers: () => api.get('users/'),
  getUserDetails: (userId: string) => api.get(`users/details/?user_id=${userId}`),
  addUser: (userData: any) => api.post('users/add', userData),
  editUser: (userData: any) => api.put('users/edit', userData),
  deleteUser: (userId: string) => api.delete(`users/delete?user_id=${userId}`),
  activateUser: (userId: string) => api.put(`users/active?user_id=${userId}`),
};

// Books related API calls
export const bookApi = {
  getBooks: () => api.get('books/'),
  getBookDetails: (bookId: string) => api.get(`books?book_id=${bookId}`),
  addBook: (bookData: any) => api.post('books/add/', bookData),
  editBook: (bookData: any) => api.put('books/edit/', bookData),
  deleteBook: (bookId: string) => api.delete(`books/delete/?book_id=${bookId}`),
  borrowBook: (borrowData: any) => api.post('books/borrow/', borrowData),
  returnBook: (returnData: any) => api.post('books/return/', returnData),
  extendRental: (extendData: any) => api.post('books/extend/', extendData),
  approveReturn: (approveData: any) => api.post('books/approve-return/', approveData),
  markAsRead: (notificationId: string) => api.put(`books/mark-as-read/?notification_id=${notificationId}`),
  subscribeToBook: (subscribeData: any) => api.post('books/notification', subscribeData),
};

// Borrows related API calls
export const borrowApi = {
  getBorrows: () => api.get('borrows/'),
};

// Articles related API calls
export const articleApi = {
  getArticles: () => api.get('articles/'),
};

// Dashboard related API calls
export const dashboardApi = {
  getCustomerDashboard: () => api.get('dashboard/customer/'),
  getEmployeeDashboard: () => api.get('dashboard/employee/'),
};