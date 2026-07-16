'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('access_token', token);
      
      // Parse the JWT to extract user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Store full user object
        localStorage.setItem('user', JSON.stringify({
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
          firstName: payload.firstName,
          lastName: payload.lastName,
          name: payload.name,
        }));
        
        // Store individual fields for easier access
        if (payload.email) {
          localStorage.setItem('user_email', payload.email);
        }
        
        // Store name - prefer full name, then username, then firstName + lastName
        let displayName = payload.name || payload.username;
        if (!displayName && payload.firstName && payload.lastName) {
          displayName = `${payload.firstName} ${payload.lastName}`;
        } else if (!displayName && payload.firstName) {
          displayName = payload.firstName;
        }
        
        if (displayName) {
          localStorage.setItem('user_name', displayName);
        }
        
        // Store Google user data if available
        if (payload.googleId || payload.given_name) {
          localStorage.setItem('google_user', JSON.stringify({
            googleId: payload.googleId,
            given_name: payload.firstName || payload.given_name,
            family_name: payload.lastName || payload.family_name,
            email: payload.email,
          }));
        }
      } catch (e) {
        console.error('Failed to parse JWT:', e);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // No token provided, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4">
        <motion.div
          className="w-12 h-12 mx-auto border-3 border-gray-700 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-gray-400 font-medium">Completing sign-in...</p>
      </div>
    </motion.div>
  );
}
