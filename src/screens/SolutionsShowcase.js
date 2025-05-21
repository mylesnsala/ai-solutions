import { useState, useEffect } from 'react';
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../database/firebase';
import { toast } from 'react-toastify';
import ContactUs from './ContactUs';

const EventRegistrationForm = ({ event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    additionalInfo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-lg bg-gray-800 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Register for Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Company</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={e => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              className="w-full rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const FirestoreDisplay = () => {
  // State for articles and events
  const [articles, setArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesPage, setArticlesPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [ratings, setRatings] = useState({});
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch articles
        const articlesQuery = query(
          collection(firestore, 'articles'),
          orderBy('createdAt', 'desc')
        );
        const articlesSnapshot = await getDocs(articlesQuery);
        const articlesData = articlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));

        // Fetch events
        const eventsQuery = query(collection(firestore, 'events'), orderBy('createdAt', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));

        // Fetch gallery images
        const galleryQuery = query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
        const gallerySnapshot = await getDocs(galleryQuery);
        const galleryData = gallerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));

        // Fetch ratings
        const ratingsQuery = query(collection(firestore, 'ratings'));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratingsData = {};

        ratingsSnapshot.docs.forEach(doc => {
          const rating = doc.data();
          if (!ratingsData[rating.solutionId]) {
            ratingsData[rating.solutionId] = {
              total: 0,
              count: 0,
              average: 0,
            };
          }
          ratingsData[rating.solutionId].total += rating.value;
          ratingsData[rating.solutionId].count += 1;
          ratingsData[rating.solutionId].average =
            ratingsData[rating.solutionId].total / ratingsData[rating.solutionId].count;
        });

        setRatings(ratingsData);
        setArticles(articlesData);
        setEvents(eventsData);
        setGalleryImages(galleryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination calculations
  const paginatedArticles = articles.slice(
    (articlesPage - 1) * itemsPerPage,
    articlesPage * itemsPerPage
  );
  const paginatedEvents = events.slice((eventsPage - 1) * itemsPerPage, eventsPage * itemsPerPage);

  const totalArticlesPages = Math.ceil(articles.length / itemsPerPage);
  const totalEventsPages = Math.ceil(events.length / itemsPerPage);

  // Event handlers
  const handleEventClick = event => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleScheduleEvent = async eventId => {
    const event = events.find(e => e.id === eventId);
    setSelectedEventForRegistration(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSubmit = async formData => {
    try {
      // Add registration to contactSubmissions collection
      await addDoc(collection(firestore, 'contactSubmissions'), {
        ...formData,
        eventId: selectedEventForRegistration.id,
        eventTitle: selectedEventForRegistration.title,
        eventDate: selectedEventForRegistration.date,
        eventTime: selectedEventForRegistration.time,
        eventLocation: selectedEventForRegistration.location,
        type: 'event_registration',
        status: 'new',
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw error;
    }
  };

  const handleRateEvent = (eventId, rating) => {
    console.log(`Rating event ${eventId} with ${rating} stars`);
    // In a real app, this would call a Firestore function
  };

  const handleSolutionClick = solution => {
    setSelectedSolution(solution);
    setShowContactForm(true);
  };

  const handleRateSolution = async (solutionId, rating) => {
    try {
      // Add new rating to ratings collection
      await addDoc(collection(firestore, 'ratings'), {
        solutionId,
        value: rating,
        timestamp: Timestamp.now(),
      });

      // Update the ratings state
      setRatings(prev => {
        const current = prev[solutionId] || { total: 0, count: 0, average: 0 };
        const newTotal = current.total + rating;
        const newCount = current.count + 1;
        const newAverage = newTotal / newCount;

        return {
          ...prev,
          [solutionId]: {
            total: newTotal,
            count: newCount,
            average: newAverage,
          },
        };
      });

      toast.success('Thank you for your rating!');
    } catch (error) {
      console.error('Error rating solution:', error);
      toast.error('Failed to submit rating');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/20 blur-3xl filter"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-3xl filter"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Services Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2 className="mb-8 text-3xl font-bold text-red-500" variants={itemVariants}>
            Software Engineering Services
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Custom Software Development</h3>
              <p className="text-gray-400">
                Tailored software solutions designed to meet your specific business needs, from web
                applications to enterprise systems.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                System Architecture & Design
              </h3>
              <p className="text-gray-400">
                Expert guidance in designing scalable, secure, and maintainable software
                architectures for your business.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Technical Consulting</h3>
              <p className="text-gray-400">
                Strategic technology consulting to help you make informed decisions about your
                software infrastructure and development.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Code Review & Optimization</h3>
              <p className="text-gray-400">
                Comprehensive code reviews and optimization services to improve performance,
                security, and maintainability.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">DevOps & CI/CD</h3>
              <p className="text-gray-400">
                Implementation of modern DevOps practices and CI/CD pipelines to streamline your
                development and deployment processes.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Technical Documentation</h3>
              <p className="text-gray-400">
                Creation of comprehensive technical documentation, including API documentation,
                system architecture, and user guides.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* AI Solutions Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2 className="mb-8 text-3xl font-bold text-red-500" variants={itemVariants}>
            Our AI Solutions
          </motion.h2>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No AI solutions available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map(solution => {
                const solutionRatings = ratings[solution.id] || { average: 0, count: 0 };
                return (
                  <motion.div
                    key={solution.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="group overflow-hidden rounded-xl border border-red-500/20 bg-gray-900/50 backdrop-blur-sm"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={solution.imageUrl}
                        alt={solution.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          onClick={() => handleSolutionClick(solution)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-semibold text-white">{solution.title}</h3>
                      <p className="mb-4 line-clamp-3 text-gray-400">{solution.description}</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {solution.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-800 px-2 py-1 text-sm text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="text-gray-400">
                            {solutionRatings.count > 0
                              ? `${solutionRatings.average.toFixed(1)} (${solutionRatings.count} ratings)`
                              : 'Not rated yet'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              onClick={() => handleRateSolution(solution.id, rating)}
                              className="text-gray-400 transition-colors hover:text-yellow-500"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  solutionRatings.average >= rating ? 'text-yellow-500' : ''
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Articles Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2 className="mb-8 text-3xl font-bold text-red-500" variants={itemVariants}>
            Articles
          </motion.h2>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No articles available at the moment.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedArticles.map(article => (
                  <motion.div
                    key={article.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="group overflow-hidden rounded-xl border border-red-500/20 bg-gray-900/50 backdrop-blur-sm"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-500">
                          {article.category}
                        </span>
                        <span className="text-sm text-gray-400">
                          {article.createdAt instanceof Date
                            ? article.createdAt.toLocaleDateString()
                            : formatDate(article.createdAt)}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-white">{article.title}</h3>
                      <p className="mb-4 line-clamp-3 text-gray-400">{article.content}</p>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-gray-800 px-2 py-1 text-sm text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-red-500"
                        >
                          Read More <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {totalArticlesPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setArticlesPage(prev => Math.max(prev - 1, 1))}
                    disabled={articlesPage === 1}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-400">
                    Page {articlesPage} of {totalArticlesPages}
                  </span>
                  <button
                    onClick={() => setArticlesPage(prev => Math.min(prev + 1, totalArticlesPages))}
                    disabled={articlesPage === totalArticlesPages}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.section>

        {/* Events Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2 className="mb-8 text-3xl font-bold text-red-500" variants={itemVariants}>
            Upcoming Events
          </motion.h2>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No upcoming events at the moment.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedEvents.map(event => (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer rounded-xl border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-lg bg-red-500/10 p-3"
                      >
                        <Calendar className="h-6 w-6 text-red-500" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold text-white">{event.title}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <p className="mt-4 line-clamp-2 text-gray-300">{event.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleScheduleEvent(event.id);
                            }}
                            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
                          >
                            Schedule
                          </button>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button
                                key={rating}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRateEvent(event.id, rating);
                                }}
                                className="text-gray-400 transition-colors duration-200 hover:text-red-500"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {totalEventsPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setEventsPage(prev => Math.max(prev - 1, 1))}
                    disabled={eventsPage === 1}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-400">
                    Page {eventsPage} of {totalEventsPages}
                  </span>
                  <button
                    onClick={() => setEventsPage(prev => Math.min(prev + 1, totalEventsPages))}
                    disabled={eventsPage === totalEventsPages}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.section>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-6">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{selectedEvent.location}</span>
              </div>
              <p className="text-gray-300">{selectedEvent.description}</p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-400 transition-colors duration-200 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => handleScheduleEvent(selectedEvent.id)}
                className="rounded-lg bg-red-500 px-6 py-2 text-white transition-colors duration-200 hover:bg-red-600"
              >
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegistrationForm && selectedEventForRegistration && (
        <EventRegistrationForm
          event={selectedEventForRegistration}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEventForRegistration(null);
          }}
          onSubmit={handleRegistrationSubmit}
        />
      )}

      {/* Contact Form Modal */}
      {showContactForm && selectedSolution && (
        <ContactUs
          onClose={() => {
            setShowContactForm(false);
            setSelectedSolution(null);
          }}
          initialData={{
            jobDetails: `I'm interested in learning more about ${selectedSolution.title}`,
            solutionId: selectedSolution.id,
            onRate: handleRateSolution,
          }}
        />
      )}
    </div>
  );
};

export default FirestoreDisplay;
