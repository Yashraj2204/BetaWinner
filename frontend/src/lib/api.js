import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// Token storage helpers
export const TokenStorage = {
  getAccess: () => localStorage.getItem("access_token"),
  setAccess: (t) => localStorage.setItem("access_token", t),
  getRefresh: () => localStorage.getItem("refresh_token"),
  setRefresh: (t) => localStorage.setItem("refresh_token", t),
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = TokenStorage.getAccess();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // If server returns tokens in body, save them
    if (response.data && response.data.access_token) {
      TokenStorage.setAccess(response.data.access_token);
    }
    if (response.data && response.data.refresh_token) {
      TokenStorage.setRefresh(response.data.refresh_token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const path = window.location.pathname;
      if (path === "/auth" || path === "/") {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenStorage.getRefresh();
      if (!refreshToken) {
        isRefreshing = false;
        TokenStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccess = res.data.access_token;
        TokenStorage.setAccess(newAccess);
        processQueue(null, newAccess);
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        TokenStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
