import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { firestore } from '../../database/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
  doc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import DashboardScreen from './DashboardScreen';
import InquiriesScreen from './InquiriesScreen';
import EventsScreen from './EventsScreen';
import GalleryScreen from './GalleryScreen';
import ArticlesScreen from './ArticlesScreen';
import AnalyticsScreen from './AnalyticsScreen';
import HelpScreen from './HelpScreen';
import SettingsScreen from './SettingsScreen';
import {
  FaUsers,
  FaEnvelope,
  FaCalendarCheck,
  FaNewspaper,
  FaChartLine,
  FaImage,
  FaQuestionCircle,
  FaCog,
  FaTimes,
  FaBars,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaReply,
  FaPaperPlane,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReplyModal = ({ inquiry, onClose, onReply }) => {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReply(reply);
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl rounded-lg bg-gray-800 p-6"
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-white">Reply to Inquiry</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-gray-900/50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-white">Original Message</h3>
          <p className="text-gray-400">{inquiry.jobDetails}</p>
          <div className="mt-2 text-sm text-gray-500">
            From: {inquiry.name} ({inquiry.email})
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Your Reply</label>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              required
              rows={6}
              className="w-full rounded-lg border border-red-500/20 bg-gray-900/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              placeholder="Type your reply here..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CustomerEnquiries = () => {
  const [path, setPath] = useState('dashboard');
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [inquiries, setInquiries] = useState([]);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: FaUsers },
    { id: 'inquiries', label: 'Inquiries', icon: FaEnvelope },
    { id: 'events', label: 'Events', icon: FaCalendarCheck },
    { id: 'gallery', label: 'Gallery', icon: FaImage },
    { id: 'articles', label: 'Articles', icon: FaNewspaper },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'help', label: 'Help', icon: FaQuestionCircle },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const statsRef = collection(firestore, 'stats');
        const q = query(statsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, snapshot => {
          const statsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStats(statsData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      }
    };

    // Fetch recent activities
    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(firestore, 'activities');
        const q = query(
          activitiesRef,
          orderBy('timestamp', 'desc'),
          where(
            'timestamp',
            '>=',
            Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        );

        const unsubscribe = onSnapshot(q, snapshot => {
          const activitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecentActivities(activitiesData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error('Failed to load recent activities');
      }
    };

    // Fetch inquiries with real-time updates
    const fetchInquiries = async () => {
      try {
        const inquiriesRef = collection(firestore, 'contactSubmissions');
        const q = query(inquiriesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, snapshot => {
          const inquiriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setInquiries(inquiriesData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        toast.error('Failed to load inquiries');
      }
    };

    // Fetch notifications with real-time updates
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(firestore, 'notifications');
        const q = query(
          notificationsRef,
          orderBy('timestamp', 'desc'),
          where('type', '==', 'email_reply')
        );

        const unsubscribe = onSnapshot(q, snapshot => {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotifications(notificationsData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      }
    };

    const unsubscribeStats = fetchStats();
    const unsubscribeActivities = fetchActivities();
    const unsubscribeInquiries = fetchInquiries();
    const unsubscribeNotifications = fetchNotifications();

    setLoading(false);

    return () => {
      unsubscribeStats?.();
      unsubscribeActivities?.();
      unsubscribeInquiries?.();
      unsubscribeNotifications?.();
    };
  }, []);

  const handleReply = async reply => {
    if (!selectedInquiry) return;

    try {
      // Add reply to the inquiry document
      await updateDoc(doc(firestore, 'contactSubmissions', selectedInquiry.id), {
        reply,
        replyTimestamp: Timestamp.now(),
        status: 'replied',
      });

      // Add to notifications collection for email sending
      await addDoc(collection(firestore, 'notifications'), {
        type: 'email_reply',
        inquiryId: selectedInquiry.id,
        recipientEmail: selectedInquiry.email,
        recipientName: selectedInquiry.name,
        message: reply,
        timestamp: Timestamp.now(),
        status: 'pending',
      });

      // Add to replies collection for inbox
      await addDoc(collection(firestore, 'replies'), {
        inquiryId: selectedInquiry.id,
        message: reply,
        timestamp: Timestamp.now(),
        to: selectedInquiry.email,
        companyName: selectedInquiry.company,
        status: 'sent',
      });

      // Optimistically update the local state
      setInquiries(prevInquiries =>
        prevInquiries.map(inquiry =>
          inquiry.id === selectedInquiry.id
            ? {
                ...inquiry,
                reply,
                replyTimestamp: Timestamp.now(),
                status: 'replied',
              }
            : inquiry
        )
      );

      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
      throw error;
    }
  };

  const renderInquiries = () => {
    return (
      <div className="space-y-4">
        {inquiries.map(inquiry => (
          <motion.div
            key={inquiry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/20 bg-gray-800/50 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{inquiry.name}</h3>
                <p className="text-gray-400">{inquiry.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    inquiry.status === 'replied'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {inquiry.status === 'replied' ? 'Replied' : 'New'}
                </span>
                <button
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setShowReplyModal(true);
                  }}
                  className="p-2 text-gray-400 transition-colors hover:text-red-500"
                >
                  <FaReply />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-300">{inquiry.jobDetails}</p>
            </div>
            <div className="text-sm text-gray-500">
              Received: {inquiry.timestamp?.toDate().toLocaleString()}
            </div>
            {inquiry.reply && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 rounded-lg bg-gray-900/50 p-4"
              >
                <h4 className="mb-2 text-sm font-medium text-gray-400">Your Reply</h4>
                <p className="text-gray-300">{inquiry.reply}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Sent: {inquiry.replyTimestamp?.toDate().toLocaleString()}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderScreen = () => {
    switch (path) {
      case 'dashboard':
        return (
          <DashboardScreen stats={stats} recentActivities={recentActivities} loading={loading} />
        );
      case 'inquiries':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Customer Inquiries</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-gray-700/50 bg-gray-800/30 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            {renderInquiries()}
          </div>
        );
      case 'events':
        return <EventsScreen />;
      case 'gallery':
        return <GalleryScreen />;
      case 'articles':
        return <ArticlesScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'help':
        return <HelpScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <DashboardScreen stats={stats} recentActivities={recentActivities} loading={loading} />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-red-500/20 bg-gray-900/95 backdrop-blur-sm lg:static lg:inset-auto lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-red-500/20 px-4">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 transition-colors hover:text-white lg:hidden"
          >
            <FaTimes />
          </button>
        </div>
        <nav className="px-4 py-4">
          {navigation.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setPath(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 transition-colors ${
                path === item.id
                  ? 'bg-red-500/20 text-red-500'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <item.icon className="mr-3" />
              {item.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 border-b border-red-500/20 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 transition-colors hover:text-white lg:hidden"
              >
                <FaBars />
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-700/50 bg-gray-800/30 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="relative text-gray-400 transition-colors hover:text-white">
                  <FaBell />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Welcome back, Admin</span>
                <button className="text-gray-400 transition-colors hover:text-white">
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedInquiry && (
          <ReplyModal
            inquiry={selectedInquiry}
            onClose={() => {
              setShowReplyModal(false);
              setSelectedInquiry(null);
            }}
            onReply={handleReply}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerEnquiries;
