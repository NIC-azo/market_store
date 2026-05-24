// README.md | [30]
import axios, { isAxiosError } from "axios";
import type {AxiosResponse, AxiosInstance, InternalAxiosRequestConfig, AxiosError} from 'axios'
import type { BackendErrorResponse } from '@/types/bd.response.schemas'

const API_URL = import.meta.env.VITE_NODE_ENV! === "dev" ?
    import.meta.env.VITE_LOCAL_API_URL! : import.meta.env.VITE_API_URL!;

export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("market-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem("market-token");
        }
        return Promise.reject(error);
    }
);

export default api;