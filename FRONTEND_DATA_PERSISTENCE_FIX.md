# Frontend Data Persistence Fix Guide

## Problem Identified

The frontend pages are showing **SEED DATA** (demo/hardcoded) instead of fetching **REAL DATA** from the API. This is why data disappears when navigating between pages.

## Solution: Replace All SEED Data with Real API Calls

### Pattern to Fix All Pages

**BEFORE (Using Demo Data):**
```typescript
const SEED_DATA = [{ id: '1', name: 'Demo' }];

export default function Page() {
  const [data, setData] = useState(SEED_DATA); // ❌ WRONG
  return <div>{data.map(...)}</div>;
}
```

**AFTER (Using Real API):**
```typescript
export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/endpoint', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{data.map(...)}</div>;
}
```

## Fix for Each Page

### 1. Dashboard Page (`apps/frontend/app/dashboard/page.tsx`)

**Replace:**
```typescript
const SEED: DashboardOverview = { ... }
const [overview, setOverview] = useState<DashboardOverview>(SEED);
```

**With:**
```typescript
useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/dashboard/overview', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };
  fetchDashboard();
}, []);
```

### 2. Workspaces Page (`apps/frontend/app/dashboard/workspaces/page.tsx`)

**Replace:**
```typescript
const SEED_WORKSPACES: Workspace[] = [...]
const [workspaces, setWorkspaces] = useState(SEED_WORKSPACES);
```

**With:**
```typescript
useEffect(() => {
  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workspaces', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  };
  fetchWorkspaces();
}, []);
```

### 3. Live Scan Page (`apps/frontend/app/dashboard/live-scan/page.tsx`)

**Key Changes:**
- Use `scanService.createScan()` instead of demo creation
- Use `scanService.getScanStatus()` for real-time progress
- Use `scanService.getScanResults()` to fetch findings

```typescript
const handleCreateScan = async (target: string, engines: string[]) => {
  try {
    const response = await scanService.createScan({
      workspaceId: selectedWorkspace.id,
      mode: 'website',
      target,
      engines
    });
    setScanId(response.scanId);
    
    // Poll for progress
    const interval = setInterval(async () => {
      const status = await scanService.getScanStatus(response.scanId);
      setProgress(status.progress);
      if (status.status === 'COMPLETED') {
        clearInterval(interval);
        const results = await scanService.getScanResults(response.scanId);
        setFindings(results.findings);
      }
    }, 2000);
  } catch (error) {
    console.error('Scan creation failed:', error);
  }
};
```

### 4. GitHub Scan Page (`apps/frontend/app/dashboard/github-scan/page.tsx`)

**Same as Live Scan but:**
```typescript
const response = await scanService.createScan({
  workspaceId: selectedWorkspace.id,
  mode: 'github',  // ← Change to github
  target,
  engines
});
```

### 5. Findings Page (`apps/frontend/app/dashboard/findings/page.tsx`)

**Replace:**
```typescript
const SEED_FINDINGS = [...]
const [findings, setFindings] = useState(SEED_FINDINGS);
```

**With:**
```typescript
useEffect(() => {
  const fetchFindings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/findings?scanId=' + selectedScanId, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFindings(data.findings || data);
      }
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    }
  };
  if (selectedScanId) fetchFindings();
}, [selectedScanId]);
```

### 6. Reports Page (`apps/frontend/app/dashboard/reports/page.tsx`)

**Replace:**
```typescript
const SEED_REPORTS = [...]
const [reports, setReports] = useState(SEED_REPORTS);
```

**With:**
```typescript
useEffect(() => {
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/reports', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };
  fetchReports();
}, []);
```

### 7. Analytics Page (`apps/frontend/app/dashboard/analytics/page.tsx`)

**Replace:**
```typescript
const SEED = {...}
const [analytics, setAnalytics] = useState(SEED);
```

**With:**
```typescript
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/analytics/overview', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };
  fetchAnalytics();
}, []);
```

### 8. Settings Page (`apps/frontend/app/dashboard/settings/page.tsx`)

**Add:**
```typescript
useEffect(() => {
  // Fetch user preferences
  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/user/preferences', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };
  fetchPreferences();
}, []);

// On Save:
const handleSaveSettings = async (newSettings: any) => {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      setPreferences(newSettings);
      // Show success message
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};
```

### 9. Notifications Page (`apps/frontend/app/dashboard/notifications/page.tsx`)

**Replace:**
```typescript
const SEED_NOTIFICATIONS = [...]
const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
```

**With:**
```typescript
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  fetchNotifications();
}, []);
```

## Implementation Steps

1. **Remove all SEED/demo data** from each page component
2. **Add useEffect hooks** to fetch from real API endpoints
3. **Add error handling** and loading states
4. **Test navigation** between pages to verify data persists
5. **Verify database** has real data being stored

## Expected Result

After fixes:
✅ Data from Dashboard persists when navigating to other pages
✅ Workspaces created stay in the list
✅ Scans executed show real findings
✅ All features use real database data
✅ No more "fading away" data on page switches

## Quick Test After Fix

1. Login to dashboard
2. Create a workspace
3. Navigate away and back → Workspace still there ✅
4. Start a live scan
5. Navigate to Findings while scan runs
6. Navigate back to Dashboard → Scan progress preserved ✅

