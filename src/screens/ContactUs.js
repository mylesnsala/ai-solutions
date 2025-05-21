import { useState } from 'react';
import {
  Send,
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  Building,
  Globe,
  Briefcase,
  MessageSquare,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { firestore } from '../database/firebase';
import { collection, addDoc } from 'firebase/firestore';

const ContactUs = ({ onClose, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    jobTitle: '',
    jobDetails: initialData?.jobDetails || '',
  });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submissionData = {
        ...formData,
        timestamp: new Date(),
      };

      await addDoc(collection(firestore, 'contactSubmissions'), submissionData);

      // If there's a rating and solutionId, submit the rating
      if (rating > 0 && initialData?.solutionId && initialData?.onRate) {
        await initialData.onRate(initialData.solutionId, rating);
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          country: '',
          jobTitle: '',
          jobDetails: '',
        });
        setRating(0);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', icon: User },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'your@email.com',
      icon: Mail,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 000-0000',
      icon: Phone,
    },
    {
      name: 'company',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Your company',
      icon: Building,
    },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'Your country', icon: Globe },
    {
      name: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      placeholder: 'Your role',
      icon: Briefcase,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-3xl filter"
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
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl filter"
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

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
      >
        <X size={24} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-3xl px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 text-center"
        >
          <motion.h2
            className="mb-4 text-4xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Contact Us
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Let's discuss how AI•TECH can transform your business
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-red-500/20 bg-gray-900/50 p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {formFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="relative"
              >
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  {field.label}
                </label>
                <div className="relative">
                  <motion.div
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    animate={{
                      color: focusedField === field.name ? '#ef4444' : '#6b7280',
                    }}
                  >
                    <field.icon size={20} />
                  </motion.div>
                  <input
                    type={field.type}
                    name={field.name}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    className="w-full rounded-lg border border-red-500/20 bg-black/50 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    placeholder={field.placeholder}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="relative"
          >
            <label className="mb-2 block text-sm font-medium text-gray-300">Job Details</label>
            <div className="relative">
              <motion.div
                className="absolute left-3 top-3 text-gray-500"
                animate={{
                  color: focusedField === 'jobDetails' ? '#ef4444' : '#6b7280',
                }}
              >
                <MessageSquare size={20} />
              </motion.div>
              <textarea
                name="jobDetails"
                required
                value={formData.jobDetails}
                onChange={handleChange}
                onFocus={() => setFocusedField('jobDetails')}
                onBlur={() => setFocusedField(null)}
                rows={4}
                className="w-full resize-none rounded-lg border border-red-500/20 bg-black/50 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                placeholder="Please describe your specific requirements..."
              />
            </div>
          </motion.div>

          {/* Rating Section */}
          {initialData?.solutionId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="relative"
            >
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Rate this Solution
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="text-2xl transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-400">
                  {rating > 0 ? `(${rating} stars)` : 'Click to rate'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="flex justify-center"
          >
            <motion.button
              type="submit"
              disabled={submitted || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-2 rounded-lg px-8 py-3 font-medium transition-all duration-300
                ${
                  submitted
                    ? 'cursor-default bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : isLoading
                      ? 'cursor-wait bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20 hover:from-red-600 hover:to-orange-600'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="submitted"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Submitted Successfully
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send size={20} />
                    </motion.div>
                    Sending Message...
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default ContactUs;
