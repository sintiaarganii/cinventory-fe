import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk handle error 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;