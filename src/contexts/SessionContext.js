import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../database/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
      if (user) {
        setLastActivity(Date.now());
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Update last activity time on user interaction
    const updateLastActivity = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    // Check for timeout
    const checkTimeout = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastActivity > TIMEOUT_DURATION) {
        handleTimeout();
      }
    }, 1000); // Check every second

    return () => {
      // Cleanup event listeners
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
      clearInterval(checkTimeout);
    };
  }, [lastActivity, isAuthenticated]);

  const handleTimeout = async () => {
    try {
      await signOut(auth);
      toast.info('Session expired due to inactivity');
      navigate('/LoginPage');
    } catch (error) {
      console.error('Error during timeout logout:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ lastActivity, setLastActivity, isAuthenticated }}>
      {children}
    </SessionContext.Provider>
  );
};
