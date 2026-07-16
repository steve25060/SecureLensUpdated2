import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  notificationCount: number;

  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;

  /** Explicitly set the collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Update notification badge count */
  setNotificationCount: (count: number) => void;

  /** Decrement count (e.g. after reading a notification) */
  clearNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  notificationCount: 3,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setNotificationCount: (count) => set({ notificationCount: count }),

  clearNotification: () =>
    set((state) => ({
      notificationCount: Math.max(0, state.notificationCount - 1),
    })),
}));
