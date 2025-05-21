import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaEnvelope,
  FaCalendarCheck,
  FaNewspaper,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaBell,
  FaSearch,
  FaEllipsisV,
  FaRegBell,
  FaRegEnvelope,
  FaRegCalendarAlt,
  FaRegNewspaper,
  FaRegEye,
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, change, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
  >
    <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-red-500/10"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-gray-700/50"></div>
            ) : (
              value
            )}
          </h3>
          <div className="mt-2 flex items-center">
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change >= 0 ? (
                <FaArrowUp className="text-xs" />
              ) : (
                <FaArrowDown className="text-xs" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="ml-2 text-sm text-gray-400">vs last month</span>
          </div>
        </div>
        <div className="rounded-lg bg-red-500/20 p-4 transition-all duration-300 group-hover:bg-red-500/30">
          <Icon className="text-2xl text-red-500" />
        </div>
      </div>
    </div>
  </motion.div>
);

const ActivityCard = ({ activity }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg border border-red-500/20 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
          <FaClock className="text-red-500" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{activity.title}</p>
        <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
        <div className="mt-2 flex items-center text-xs text-gray-400">
          <span>{activity.time}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
      <Icon className="text-xl text-red-500" />
    </div>
    <span className="text-sm font-medium text-white">{label}</span>
  </motion.button>
);

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: FaUsers, title: 'Total Visitors', value: '0', change: 0 },
    { icon: FaEnvelope, title: 'New Inquiries', value: '0', change: 0 },
    { icon: FaCalendarCheck, title: 'Upcoming Events', value: '0', change: 0 },
    { icon: FaNewspaper, title: 'Published Articles', value: '0', change: 0 },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [analytics, setAnalytics] = useState({
    visitors: [],
    inquiries: [],
    events: [],
    articles: [],
  });

  useEffect(() => {
    const unsubscribeActivities = onSnapshot(
      query(collection(firestore, 'activities'), orderBy('timestamp', 'desc'), limit(5)),
      snapshot => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: new Date(doc.data().timestamp?.toDate()).toLocaleString(),
        }));
        setRecentActivities(activities);
      }
    );

    const unsubscribeVisitors = onSnapshot(collection(firestore, 'visitors'), snapshot => {
      const visitors = snapshot.docs.map(doc => doc.data());
      setAnalytics(prev => ({ ...prev, visitors }));
      updateStats('visitors', visitors.length);
    });

    const unsubscribeInquiries = onSnapshot(collection(firestore, 'inquiries'), snapshot => {
      const inquiries = snapshot.docs.map(doc => doc.data());
      setAnalytics(prev => ({ ...prev, inquiries }));
      updateStats('inquiries', inquiries.length);
    });

    const unsubscribeEvents = onSnapshot(
      query(collection(firestore, 'events'), where('date', '>=', Timestamp.now())),
      snapshot => {
        const events = snapshot.docs.map(doc => doc.data());
        setAnalytics(prev => ({ ...prev, events }));
        updateStats('events', events.length);
      }
    );

    const unsubscribeArticles = onSnapshot(collection(firestore, 'articles'), snapshot => {
      const articles = snapshot.docs.map(doc => doc.data());
      setAnalytics(prev => ({ ...prev, articles }));
      updateStats('articles', articles.length);
    });

    setLoading(false);

    return () => {
      unsubscribeActivities();
      unsubscribeVisitors();
      unsubscribeInquiries();
      unsubscribeEvents();
      unsubscribeArticles();
    };
  }, []);

  const updateStats = (type, value) => {
    setStats(prev =>
      prev.map(stat => {
        if (stat.title.toLowerCase().includes(type)) {
          return {
            ...stat,
            value: value.toString(),
            change: calculateChange(type, value),
          };
        }
        return stat;
      })
    );
  };

  const calculateChange = (type, currentValue) => {
    return Math.floor(Math.random() * 20) - 10;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            {/* <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening.</p> */}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="rounded-lg border border-red-500/20 bg-gray-900/50 py-2 pl-10 pr-4 text-white placeholder-gray-400 backdrop-blur-sm focus:border-red-500/40 focus:outline-none"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="rounded-lg border border-red-500/20 bg-gray-900/50 p-2 text-gray-400 backdrop-blur-sm hover:border-red-500/40">
              <FaBell />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} loading={loading} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <FaClock className="text-red-500" />
                  Recent Activities
                </h2>
                <button className="text-sm text-red-500 hover:text-red-400">View All</button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-700/50"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-700/50"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400">No recent activities</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <FaChartLine className="text-red-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton icon={FaRegEnvelope} label="View Inquiries" />
              <QuickActionButton icon={FaRegCalendarAlt} label="Create Event" />
              <QuickActionButton icon={FaRegNewspaper} label="Add Article" />
              <QuickActionButton icon={FaRegEye} label="View Gallery" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
