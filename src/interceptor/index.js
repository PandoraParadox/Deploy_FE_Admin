import axios from 'axios';
import { url } from '../util/Url';
import { getToken } from '../service/AuthService';

const axiosInstance = axios.create({
  baseURL: url, 
  timeout: 10000, 
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
