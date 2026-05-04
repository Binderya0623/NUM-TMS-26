import { analyticApi } from '../lib/apiClient';

export const analyticService = {
  getOverview: () =>
    analyticApi.get<Record<string, number>>('/api/analytics/overview')
      .catch(() => ({ data: {} as Record<string, number> })),
};
