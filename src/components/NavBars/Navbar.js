import React, { useState, useEffect } from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore } from '../../database/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ isCollapsed }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        try {
          const q = query(collection(firestore, 'admin'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setCurrentUser(null);
            navigate('/LoginPage');
          } else {
            const userData = querySnapshot.docs[0].data();
            setCurrentUser(userData);
          }
        } catch (error) {
          setCurrentUser(null);
          navigate('/LoginPage');
        }
      } else {
        setCurrentUser(null);
        navigate('/LoginPage');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/LandingPage');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-red-500/20 bg-gray-900/50 px-6 backdrop-blur-sm transition-all duration-300 ${
        isCollapsed ? 'lg:left-16' : 'lg:left-64'
      } left-0`}
    >
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h1
          className="cursor-pointer bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-xl font-extrabold text-transparent drop-shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Thato Nsala AI Solutions
        </motion.h1>
      </motion.div>
      <div className="flex items-center space-x-4">
        <motion.button
          className="relative rounded-full p-2 hover:bg-red-500/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <FaBell className="text-xl text-gray-300" />
          </motion.span>
          {notifications.length > 0 && (
            <motion.span
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {notifications.length}
            </motion.span>
          )}
        </motion.button>
        <div className="flex items-center space-x-3">
          <div className="hidden text-right sm:block">
            {currentUser ? (
              <>
                <motion.p
                  className="text-sm font-medium text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >{`${currentUser.firstname} ${currentUser.lastname}`}</motion.p>
                <motion.p
                  className="text-xs text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {auth.currentUser?.email}
                </motion.p>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="mb-1 h-4 w-24 rounded bg-red-500/20"></div>
                <div className="h-3 w-32 rounded bg-red-500/20"></div>
              </div>
            )}
          </div>
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.1 }}
          >
            {currentUser ? (
              <FaUserCircle className="text-xl text-red-500" />
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent"
              />
            )}
          </motion.div>
          <motion.button
            onClick={handleSignOut}
            className="rounded-full p-2 text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt className="text-xl" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
