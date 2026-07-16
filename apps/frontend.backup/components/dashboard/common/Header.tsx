'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [initials, setInitials] = useState('U');
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const loadUserData = () => {
      const userStr = localStorage.getItem('user');
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');
      const googleUser = localStorage.getItem('google_user');

      let userData: User = {};

      // Try to parse stored user object first
      if (userStr) {
        try {
          userData = JSON.parse(userStr);
        } catch (e) {
          // If parsing fails, continue
        }
      }

      // Use individual fields if available
      if (userEmail) {
        userData.email = userEmail;
      }
      if (userName) {
        userData.name = userName;
      }

      // Check for Google user data
      if (googleUser) {
        try {
          const googleData = JSON.parse(googleUser);
          userData.firstName = googleData.given_name;
          userData.lastName = googleData.family_name;
          userData.email = googleData.email;
        } catch (e) {
          // If parsing fails, continue
        }
      }

      setUser(userData);

      // Generate initials
      let displayName = '';
      if (userData.name) {
        displayName = userData.name;
      } else if (userData.firstName && userData.lastName) {
        displayName = `${userData.firstName} ${userData.lastName}`;
      } else if (userData.firstName) {
        displayName = userData.firstName;
      } else if (userData.email) {
        displayName = userData.email.split('@')[0];
      }

      if (displayName) {
        const parts = displayName.split(' ');
        const initials = parts
          .map((part) => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
        setInitials(initials || 'U');
      }
    };

    loadUserData();

    // Listen for profile update events from Settings page
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      loadUserData();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  // Get display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('google_user');
    
    router.push('/login');
  };

  return (
    <header className="w-full flex items-center justify-between bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-3 z-30">
      {/* ── Left: Search ──────────────────────────────── */}
      <div className="relative w-72">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search anything... ⌘K"
          className="w-full rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-300 placeholder-gray-500
                     pl-9 pr-4 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40
                     transition-colors"
          aria-label="Global search"
        />
      </div>

      {/* ── Right: Actions ────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Notifications (5 unread)"
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-gray-900"
            aria-hidden="true"
          />
          {/* Numeric badge */}
          <span className="absolute -top-0.5 -right-0.5 text-[9px] leading-none bg-red-500 text-white rounded-full px-1 py-0.5 font-bold">
            5
          </span>
        </button>

        {/* Help */}
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-700" aria-hidden="true" />

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold select-none">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{getDisplayName()}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Admin</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-44 bg-gray-900 border border-gray-800 rounded-xl shadow-xl py-1 z-50"
              role="menu"
            >
              {[
                { label: 'Profile', href: '/dashboard/settings' },
                { label: 'Settings', href: '/dashboard/settings' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  role="menuitem"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                role="menuitem"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
