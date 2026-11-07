import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-toastify";

const BASE_URL = "/api/v1";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const attachErrorMeta = (error) => {
  const backendError = error.response?.data?.error;
  error.normalizedMessage =
    backendError?.message ||
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred";
  error.errorCode = backendError?.code || "SRV_001";
  error.traceId = error.response?.data?.traceId || null;
  error.httpStatus = error.response?.status || 0;
  console.error(
    `[API Error] [${error.errorCode}] ${error.httpStatus} — ${error.normalizedMessage}${error.traceId ? ` | TraceId: ${error.traceId}` : ""}`,
    { path: error.config?.url, method: error.config?.method }
  );
};

const redirectToLogin = (originalRequest) => {
  const isBackgroundAuthCheck =
    originalRequest.url.includes("/auth/check-Auth") || originalRequest.url.includes("/auth/refresh");
  if (isBackgroundAuthCheck || typeof window === "undefined") return;
  toast.error("Session expired. Please sign in again.");
  const currentPath = window.location.pathname + window.location.search;
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

const queueRefreshRequest = (instance, originalRequest) =>
  new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  })
    .then(() => instance(originalRequest))
    .catch((err) => Promise.reject(err));

const handleUnauthorized = async (instance, originalRequest) => {
  if (isRefreshing) return queueRefreshRequest(instance, originalRequest);
  originalRequest._retry = true;
  isRefreshing = true;
  try {
    await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
    processQueue(null);
    return instance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError);
    useAuthStore.setState({ authUser: null, isAuthenticated: false });
    redirectToLogin(originalRequest);
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

const addInterceptors = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      attachErrorMeta(error);
      if (error.httpStatus === 401 && !originalRequest._retry) {
        return handleUnauthorized(instance, originalRequest);
      }
      if (error.httpStatus === 429) {
        toast.error("Too many requests. Please slow down.");
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

/**
 * =========================
 * AUTH SERVICE
 * =========================
 */
export const axiosInstanceAuthService = addInterceptors(axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
}));

/**
 * =========================
 * PROBLEM SERVICE
 * =========================
 */
export const axiosInstanceProblemService = addInterceptors(axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
}));

/**
 * =========================
 * CONTEST SERVICE
 * =========================
 */
export const axiosInstanceContestService = addInterceptors(axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
}));

/**
 * =========================
 * SUBMISSION SERVICE
 * =========================
 */
export const axiosInstanceSubmissionService = addInterceptors(axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
}));
