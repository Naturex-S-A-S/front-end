import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  }
});

let accessTokenCache: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(async config => {
  const token = accessTokenCache || (await getSession())?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // getSession() dispara el JWT callback de next-auth,
      // que internamente refresca el token si expiró
      const session = await getSession();

      if (session?.access_token) {
        // JWT callback refrescó exitosamente (o token aún vigente)
        accessTokenCache = session.access_token;
        processQueue(null, session.access_token);
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;

        return api(originalRequest);
      }

      // Sesión nula o sin token → refresh falló → forzar re-login
      throw new Error("Session invalid after refresh attempt");
    } catch (refreshError) {
      processQueue(refreshError, null);
      accessTokenCache = null;
      signOut({ callbackUrl: "/login" });

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const API = () => api;
