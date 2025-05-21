import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaEnvelope,
  FaCalendarAlt,
  FaImages,
  FaNewspaper,
  FaChartBar,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaQuestionCircle,
  FaCog,
} from 'react-icons/fa';
import { auth, firestore } from '../database/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        try {
          const q = query(collection(firestore, 'admin'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setCurrentUser(null);
          } else {
            const userData = querySnapshot.docs[0].data();
            setCurrentUser(userData);
          }
        } catch (error) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/inquiries', icon: FaEnvelope, label: 'Customer Inquiries' },
    { path: '/admin/events', icon: FaCalendarAlt, label: 'Events' },
    { path: '/admin/gallery', icon: FaImages, label: 'Gallery' },
    { path: '/admin/articles', icon: FaNewspaper, label: 'Articles' },
    { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/admin/help', icon: FaQuestionCircle, label: 'Help' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-lg bg-red-500/20 p-2 text-red-500 transition-colors hover:bg-red-500/30 lg:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        aria-label="Toggle sidebar"
      >
        {!isCollapsed ? <FaTimes /> : <FaBars />}
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed left-0 top-0 z-40 h-screen border-r border-red-500/20 bg-gray-900/50 text-white backdrop-blur-sm transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-0 lg:w-16' : 'w-64'}
          ${isHovered && isCollapsed ? 'lg:w-64' : ''}
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-full p-6">
          {/* Collapse Toggle Button (Desktop) */}
          <motion.button
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 hidden rounded-full bg-red-500/20 p-1 text-red-500 transition-colors hover:bg-red-500/30 lg:flex"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Collapse sidebar"
          >
            {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </motion.button>

          {/* User Profile Section */}
          <motion.div
            className={`mb-8 text-center transition-all duration-300 ${isCollapsed && !isHovered ? 'mb-0 h-0 scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.08 }}
            >
              {currentUser ? (
                <FaUserCircle className="text-4xl text-red-500" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-6 w-6 rounded-full border-2 border-red-500 border-t-transparent"
                />
              )}
            </motion.div>
            <motion.h2
              className="mb-1 truncate text-lg font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentUser ? (
                `${currentUser.firstname} ${currentUser.lastname}`
              ) : (
                <div className="animate-pulse">
                  <div className="mx-auto h-4 w-32 rounded bg-red-500/20"></div>
                </div>
              )}
            </motion.h2>
            <motion.p
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Administrator
            </motion.p>
          </motion.div>

          {/* Navigation */}
          <nav
            className={`transition-opacity duration-300 ${isCollapsed && !isHovered ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}
          >
            <ul className="space-y-2">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * idx }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center rounded-lg p-3 transition-colors ${
                        isActive
                          ? 'bg-red-500/20 text-red-500'
                          : 'text-gray-300 hover:bg-red-500/10 hover:text-red-500'
                      }`}
                      title={item.label}
                    >
                      <motion.span
                        whileHover={{ scale: 1.2 }}
                        className={`${isActive ? 'text-red-500' : ''} ${!isCollapsed || isHovered ? 'mr-3' : 'mx-auto'}`}
                      >
                        <item.icon />
                      </motion.span>
                      <span
                        className={`transition-all duration-300 ${isCollapsed && !isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 border-t border-red-500/20 p-4 text-center transition-all duration-300 ${isCollapsed && !isHovered ? 'opacity-0' : 'opacity-100'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="text-xs text-gray-400">© 2025 AI•SOLUTIONS</span>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
