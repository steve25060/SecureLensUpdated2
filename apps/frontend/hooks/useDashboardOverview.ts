import { useEffect, useState } from 'react';
import type { DashboardOverview } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboard.service';

export const useDashboardOverview = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardOverview()
      .then(setOverview)
      .catch((err: any) => setError(err?.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return { overview, loading, error };
};
