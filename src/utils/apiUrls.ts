// src/utils/apiUrls.ts
const API_URLS = {
    AUTH: {
      LOGIN: '/token/',
      REFRESH: '/token/refresh/',
      REGISTER: '/register/',
    },
    USER: {
      DETAILS: '/users/details/',
      LIST: '/users/',
      EDIT: '/users/edit/',
      DELETE: '/users/delete/',
    },
    BOOKS: {
      LIST: '/books/',
      DETAIL: '/books/details/',
      BORROW: '/books/borrow/',
      RETURN: '/books/return/',
    },
    DASHBOARD: {
      CUSTOMER: '/dashboard/customer/',
      EMPLOYEE: '/dashboard/employee/',
    },
  };
  
  export default API_URLS;
  