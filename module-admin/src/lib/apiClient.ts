import axios, { type InternalAxiosRequestConfig, AxiosError, type AxiosResponse } from 'axios';
import { getStoredUser } from './authGuard';

/**
 * Backend service base URLs.
 *
 * Each one is overridable at build time via `VITE_API_<NAME>` so the same
 * bundle can be deployed to any environment. Defaults assume the localhost
 * dev cluster on the canonical ports.
 *
 *   .env.development → loaded by `vite dev`
 *   .env.production  → loaded by `vite build`
 *
 * Port note: grading_service_v2 lives on :8091 (it moved from :8086 which
 * collides with user_service).
 */
const env = import.meta.env;

const servicePort = {
  user: 8086,
  topic: 8081,
  workflow: 8084,
  committee: 8082,
  thesis: 8083,
  evaluation: 8085,
  notification: 8087,
  report: 8088,
  message: 8089,
  analytic: 8090,
  grading: 8091,
} as const;

function defaultBaseUrl(port: number) {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${port}`;
  }
  return `http://localhost:${port}`;
}

const BASE_URLS = {
  user:         env.VITE_API_USER         ?? defaultBaseUrl(servicePort.user),
  topic:        env.VITE_API_TOPIC        ?? defaultBaseUrl(servicePort.topic),
  workflow:     env.VITE_API_WORKFLOW     ?? defaultBaseUrl(servicePort.workflow),
  committee:    env.VITE_API_COMMITTEE    ?? defaultBaseUrl(servicePort.committee),
  thesis:       env.VITE_API_THESIS       ?? defaultBaseUrl(servicePort.thesis),
  evaluation:   env.VITE_API_EVALUATION   ?? defaultBaseUrl(servicePort.evaluation),
  notification: env.VITE_API_NOTIFICATION ?? defaultBaseUrl(servicePort.notification),
  report:       env.VITE_API_REPORT       ?? defaultBaseUrl(servicePort.report),
  message:      env.VITE_API_MESSAGE      ?? defaultBaseUrl(servicePort.message),
  analytic:     env.VITE_API_ANALYTIC     ?? defaultBaseUrl(servicePort.analytic),
  grading:      env.VITE_API_GRADING      ?? defaultBaseUrl(servicePort.grading),
};

const TOKEN_STORAGE_KEY = 'mauth_token';

function makeClient(baseURL: string) {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const user = getStoredUser();
    if (user?.userId) config.headers['X-User-Id'] = user.userId;
    // Attach the JWT minted by auth-service (/auth/login) to every request.
    // Backend filters check this header to authenticate; absence → 401.
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });

  // Centralized response handler. 401 → token expired or invalid → kick the
  // user back to login so they don't keep firing failing requests.
  client.interceptors.response.use(
    (resp: AxiosResponse) => resp,
    (err: AxiosError) => {
      if (err?.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Avoid a redirect loop while the login MFE itself talks to auth-service.
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth.xhtml#/auth/login';
        }
      }
      return Promise.reject(err);
    }
  );
  return client;
}

export const userApi           = makeClient(BASE_URLS.user);
export const topicApi          = makeClient(BASE_URLS.topic);
export const workflowApi       = makeClient(BASE_URLS.workflow);
export const committeeApi      = makeClient(BASE_URLS.committee);
export const thesisApi         = makeClient(BASE_URLS.thesis);
export const evaluationApi     = makeClient(BASE_URLS.evaluation);
export const notificationApi   = makeClient(BASE_URLS.notification);
export const reportApi         = makeClient(BASE_URLS.report);
export const messageApi        = makeClient(BASE_URLS.message);
export const analyticApi       = makeClient(BASE_URLS.analytic);
export const gradingApi        = makeClient(BASE_URLS.grading);
