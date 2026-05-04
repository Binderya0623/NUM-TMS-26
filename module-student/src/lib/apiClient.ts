import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getStoredUser } from './authGuard';

/**
 * Backend service base URLs.
 *
 * Migrated to v2 services (workflow_service_v2, evaluation_service_v2,
 * report_service_v2, grading_service_v2) + new message_service.
 *
 * Port collision was resolved by moving grading_service_v2 from :8086
 * (taken by user_service) → :8091.
 */
const BASE_URLS = {
  user:         'http://localhost:8086',
  topic:        'http://localhost:8081',
  workflow:     'http://localhost:8084', // workflow_service_v2
  committee:    'http://localhost:8082',
  thesis:       'http://localhost:8083',
  evaluation:   'http://localhost:8085', // evaluation_service_v2
  notification: 'http://localhost:8087',
  report:       'http://localhost:8088', // report_service_v2
  message:      'http://localhost:8089', // NEW message_service
  analytic:     'http://localhost:8090',
  grading:      'http://localhost:8091', // grading_service_v2 (moved from 8086)
};

function makeClient(baseURL: string) {
  const client = axios.create({ baseURL });
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const user = getStoredUser();
    if (user?.userId) {
      config.headers['X-User-Id'] = user.userId;
    }
    return config;
  });
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
