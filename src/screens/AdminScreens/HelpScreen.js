import React, { useState } from 'react';
import {
  FaQuestionCircle,
  FaSearch,
  FaBook,
  FaHeadset,
  FaVideo,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaSpinner,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const HelpScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
  });

  const faqItems = [
    {
      question: 'How do I manage customer inquiries?',
      answer:
        'Navigate to the Inquiries section to view, respond to, and manage all customer inquiries. You can reply directly, mark as resolved, or delete inquiries as needed.',
    },
    {
      question: 'How do I add new content to the gallery?',
      answer:
        "Go to the Gallery section and click 'Add New'. You can upload images, add descriptions, and categorize them by industry.",
    },
    {
      question: 'How do I create and manage events?',
      answer:
        'Visit the Events section to create new events, set dates, and manage existing events. You can also track event registrations and send notifications.',
    },
    {
      question: 'How do I view analytics?',
      answer:
        'The Analytics section provides detailed insights into website traffic, user engagement, and content performance. You can filter data by date range and export reports.',
    },
  ];

  const resources = [
    {
      title: 'User Guide',
      icon: FaBook,
      description: 'Comprehensive guide to using the admin dashboard',
      link: '#',
    },
    {
      title: 'Video Tutorials',
      icon: FaVideo,
      description: 'Step-by-step video guides for common tasks',
      link: '#',
    },
    {
      title: 'API Documentation',
      icon: FaFileAlt,
      description: 'Technical documentation for developers',
      link: '#',
    },
  ];

  const filteredFaqs = faqItems.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Support ticket submitted successfully!');
      setTicketForm({ subject: '', description: '' });
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = e => {
    setTicketForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const FaqItem = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="overflow-hidden rounded-lg bg-gray-800/50"
    >
      <button
        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-800/70"
      >
        <h3 className="text-left font-medium text-white">{item.question}</h3>
        <motion.div
          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowRight className="text-red-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedFaq === index && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <p className="text-gray-400">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm"
      >
        <div className="flex space-x-4 border-b border-red-500/20">
          {[
            { id: 'faq', icon: FaQuestionCircle, label: 'FAQ' },
            { id: 'resources', icon: FaBook, label: 'Resources' },
            { id: 'support', icon: FaHeadset, label: 'Support' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center px-2 pb-4 ${
                activeSection === tab.id
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <AnimatePresence mode="wait">
          {activeSection === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-4"
            >
              {filteredFaqs.map((item, index) => (
                <FaqItem key={index} item={item} index={index} />
              ))}
            </motion.div>
          )}

          {/* Resources Section */}
          {activeSection === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {resources.map((resource, index) => (
                <motion.a
                  key={index}
                  href={resource.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-lg bg-gray-800/50 p-6 transition-colors hover:bg-gray-800/70"
                >
                  <resource.icon className="mb-4 text-2xl text-red-500 transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 font-medium text-white">{resource.title}</h3>
                  <p className="text-sm text-gray-400">{resource.description}</p>
                </motion.a>
              ))}
            </motion.div>
          )}

          {/* Support Section */}
          {activeSection === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gray-800/50 p-6"
              >
                <h3 className="mb-4 font-medium text-white">Contact Support</h3>
                <p className="mb-4 text-gray-400">
                  Need help? Our support team is available 24/7 to assist you.
                </p>
                <div className="space-y-4">
                  <div className="flex cursor-pointer items-center text-gray-400 transition-colors hover:text-white">
                    <FaEnvelope className="mr-2 text-red-500" />
                    <span>support@example.com</span>
                  </div>
                  <div className="flex cursor-pointer items-center text-gray-400 transition-colors hover:text-white">
                    <FaPhone className="mr-2 text-red-500" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-gray-800/50 p-6"
              >
                <h3 className="mb-4 font-medium text-white">Submit a Ticket</h3>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={ticketForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-red-500/20 bg-gray-900/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={ticketForm.description}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-red-500/20 bg-gray-900/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      rows="4"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Ticket
                        <FaCheck className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HelpScreen;
