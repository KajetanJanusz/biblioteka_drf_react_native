import { api } from '../services/authService';

interface Credentials {
  username: string;
  password: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_employee: boolean;
  is_active: boolean;
}

interface BookData {
  title: string;
  author: string;
  category: string;
  isbn: string;
  total_copies: number;
  description: string;
  published_date: string;
}


export const authApi = {
  login: (credentials: Credentials) => 
    api.post('token/', credentials),
  refreshToken: (refreshToken: string) => 
    api.post('token/refresh/', { refresh: refreshToken }),
  register: (username: string, password: string) => 
    api.post('register/', {username: username, password: password}),
};

export const userApi = {
  getUsers: () => api.get('users/'),
  getUserDetails: (userId: number) => 
    api.get(`users/details/${userId}`),
  addUser: (userData: UserData) => 
    api.post('users/add', userData),
  editUser: (userId: number, userData: Omit<UserData, 'is_active' | 'is_employee'>) => 
    api.put(`users/edit/${userId}`, userData),
  deleteUser: (userId: string) => 
    api.delete(`users/delete/${userId}`),
  activateUser: (userId: string) => 
    api.put(`users/active/${userId}`),
};

export const bookApi = {
  getBooks: () => api.get('books/'),
  getBookDetails: (bookId: number) => 
    api.get(`books/details/${bookId}`),
  addBook: (bookData: BookData) => 
    api.post('books/add/', bookData),
  editBook: (bookId: number, bookData: BookData) => 
    api.put(`books/edit/${bookId}`, bookData),
  deleteBook: (bookId: number) => 
    api.delete(`books/delete/${bookId}`),
  borrowBook: (bookId: number) => 
    api.post(`books/borrow/${bookId}`),
  returnBook: (rentalId: number) => 
    api.post(`books/return/${rentalId}`),
  extendRental: (rentalId: number) => 
    api.post(`books/extend/${rentalId}`),
  approveReturn: (rentalId: number) => 
    api.post(`books/approve-return/${rentalId}`),
  markAsRead: (notificationId: number) => 
    api.post(`books/mark-as-read/${notificationId}`),
  subscribeToBook: (notificationId: number) => 
    api.post(`books/notification/${notificationId}`),
};

export const borrowApi = {
  getBorrows: () => api.get('borrows/'),
};

export const articleApi = {
  getArticles: () => api.get('articles/'),
};

export const dashboardApi = {
  getCustomerDashboard: () => api.get('dashboard/customer/'),
  getEmployeeDashboard: () => api.get('dashboard/employee/'),
};