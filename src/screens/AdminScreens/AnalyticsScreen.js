import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaGlobe,
  FaDesktop,
  FaEnvelope,
  FaIndustry,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    totalInquiries: 0,
    recentInquiries: 0,
    countries: {},
    industries: {},
    monthlyInquiries: {},
    responseRate: 0,
    monthlyData: {
      labels: [],
      values: [],
    },
    previousPeriodData: {
      totalInquiries: 0,
      responseRate: 0,
    },
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const inquiriesRef = collection(firestore, 'contactSubmissions');
        const repliesRef = collection(firestore, 'replies');

        // Set up real-time listeners
        const unsubscribeInquiries = onSnapshot(inquiriesRef, snapshot => {
          const inquiries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Get replies count
          onSnapshot(repliesRef, repliesSnapshot => {
            const replies = repliesSnapshot.docs.length;

            // Calculate time range
            const now = new Date();
            let startDate;
            switch (timeRange) {
              case '7d':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
              case '30d':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
              case '90d':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
              default:
                startDate = new Date(now.setDate(now.getDate() - 30));
            }

            const countries = {};
            const industries = {};
            const monthlyInquiries = {};

            let recentInquiries = 0;
            let previousPeriodInquiries = 0;

            inquiries.forEach(inquiry => {
              const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);

              // Count countries
              countries[inquiry.country] = (countries[inquiry.country] || 0) + 1;

              // Count industries
              const industry = determineIndustry(inquiry.jobTitle, inquiry.company);
              industries[industry] = (industries[industry] || 0) + 1;

              // Count monthly inquiries
              const month = inquiryDate.toLocaleString('default', { month: 'short' });
              monthlyInquiries[month] = (monthlyInquiries[month] || 0) + 1;

              // Count recent inquiries
              if (inquiryDate > startDate) {
                recentInquiries++;
              }

              // Count previous period inquiries
              const previousStartDate = new Date(startDate);
              previousStartDate.setDate(previousStartDate.getDate() - (now - startDate));
              if (inquiryDate > previousStartDate && inquiryDate <= startDate) {
                previousPeriodInquiries++;
              }
            });

            // Process monthly data
            const monthlyCount = {};
            inquiries.forEach(inquiry => {
              const date = new Date(inquiry.timestamp.seconds * 1000);
              const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
              monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
            });

            // Sort months chronologically
            const sortedMonths = Object.keys(monthlyCount).sort((a, b) => {
              return new Date(a) - new Date(b);
            });

            setAnalytics({
              totalInquiries: inquiries.length,
              recentInquiries,
              countries,
              industries,
              monthlyInquiries,
              responseRate: (replies / inquiries.length) * 100,
              monthlyData: {
                labels: sortedMonths,
                values: sortedMonths.map(month => monthlyCount[month]),
              },
              previousPeriodData: {
                totalInquiries: previousPeriodInquiries,
                responseRate:
                  previousPeriodInquiries > 0 ? (replies / previousPeriodInquiries) * 100 : 0,
              },
            });
            setLoading(false);
          });
        });

        return () => {
          unsubscribeInquiries();
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Helper function to determine industry
  const determineIndustry = (jobTitle, company) => {
    const techKeywords = ['tech', 'software', 'it', 'digital', 'ai', 'machine learning', 'data'];
    const financeKeywords = ['finance', 'bank', 'investment', 'insurance', 'accounting'];
    const healthcareKeywords = ['health', 'medical', 'hospital', 'pharma', 'biotech'];
    const educationKeywords = ['education', 'school', 'university', 'college', 'learning'];
    const retailKeywords = ['retail', 'shop', 'store', 'ecommerce', 'market'];

    const text = `${jobTitle} ${company}`.toLowerCase();

    if (techKeywords.some(keyword => text.includes(keyword))) return 'Technology';
    if (financeKeywords.some(keyword => text.includes(keyword))) return 'Finance';
    if (healthcareKeywords.some(keyword => text.includes(keyword))) return 'Healthcare';
    if (educationKeywords.some(keyword => text.includes(keyword))) return 'Education';
    if (retailKeywords.some(keyword => text.includes(keyword))) return 'Retail';
    return 'Other';
  };

  const StatCard = ({ title, value, icon: Icon, change, loading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gray-800/50 p-6 transition-colors hover:bg-gray-800/70"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {loading ? <FaSpinner className="animate-spin text-red-500" /> : value}
          </h3>
          {change !== undefined && !loading && (
            <p
              className={`mt-1 flex items-center gap-1 text-sm ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(change)}% from previous period
            </p>
          )}
        </div>
        <div className="rounded-lg bg-red-500/20 p-3">
          <Icon className="text-xl text-red-500" />
        </div>
      </div>
    </motion.div>
  );

  const calculateChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="rounded-lg bg-gray-800/50 p-1">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-red-500/20 text-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inquiries"
          value={analytics.totalInquiries}
          icon={FaEnvelope}
          change={calculateChange(
            analytics.recentInquiries,
            analytics.previousPeriodData.totalInquiries
          )}
          loading={loading}
        />
        <StatCard
          title={`Recent Inquiries (${timeRange})`}
          value={analytics.recentInquiries}
          icon={FaUsers}
          change={calculateChange(
            analytics.recentInquiries,
            analytics.previousPeriodData.totalInquiries
          )}
          loading={loading}
        />
        <StatCard
          title="Response Rate"
          value={`${analytics.responseRate.toFixed(1)}%`}
          icon={FaChartLine}
          change={calculateChange(
            analytics.responseRate,
            analytics.previousPeriodData.responseRate
          )}
          loading={loading}
        />
        <StatCard
          title="Countries Reached"
          value={Object.keys(analytics.countries).length}
          icon={FaGlobe}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Inquiries Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">Monthly Inquiries</h3>
          <div className="h-[300px]">
            {!loading && (
              <Line
                data={{
                  labels: analytics.monthlyData.labels,
                  datasets: [
                    {
                      label: 'Inquiries',
                      data: analytics.monthlyData.values,
                      borderColor: 'rgb(239, 68, 68)',
                      tension: 0.4,
                      fill: true,
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Industry Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">Industry Distribution</h3>
          <div className="h-[300px]">
            {!loading && (
              <Doughnut
                data={{
                  labels: Object.keys(analytics.industries),
                  datasets: [
                    {
                      data: Object.values(analytics.industries),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Geographical Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">Geographical Distribution</h3>
          <div className="h-[300px]">
            {!loading && (
              <Bar
                data={{
                  labels: Object.keys(analytics.countries),
                  datasets: [
                    {
                      label: 'Inquiries by Country',
                      data: Object.values(analytics.countries),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
