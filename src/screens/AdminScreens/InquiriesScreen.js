import React, { useState, useEffect, useRef } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaGlobe,
  FaUser,
  FaBriefcase,
  FaClock,
  FaReply,
  FaTimes,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaEllipsisV,
  FaStar,
  FaRegStar,
  FaCalendar,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const MessageThread = ({ inquiry, onClose, onDelete }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch messages for this inquiry
    const fetchMessages = async () => {
      const messagesQuery = query(
        collection(firestore, 'replies'),
        where('inquiryId', '==', inquiry.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, snapshot => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
        scrollToBottom();
      });

      // Fetch email status
      const notificationsQuery = query(
        collection(firestore, 'notifications'),
        where('inquiryId', '==', inquiry.id),
        where('type', '==', 'email_reply'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const unsubscribeNotifications = onSnapshot(notificationsQuery, snapshot => {
        if (!snapshot.empty) {
          const latestNotification = snapshot.docs[0].data();
          setEmailStatus(latestNotification.status);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeNotifications();
      };
    };

    fetchMessages();
  }, [inquiry.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      // Create a temporary message ID
      const tempId = 'temp-' + Date.now();

      // Create the message object
      const messageObj = {
        inquiryId: inquiry.id,
        message: newMessage,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          content: null, // We'll update this after conversion
        })),
        timestamp: Timestamp.now(),
        to: inquiry.email,
        companyName: inquiry.company,
        status: 'sent',
      };

      // Optimistically add the message to the local state
      setMessages(prevMessages => [...prevMessages, { ...messageObj, id: tempId }]);
      scrollToBottom();

      // Convert attachments to base64 if needed
      const processedAttachments = await Promise.all(
        attachments.map(async file => {
          const content = await convertToBase64(file);
          return {
            name: file.name,
            type: file.type,
            content,
          };
        })
      );

      // Add to replies collection for chat history
      const replyRef = await addDoc(collection(firestore, 'replies'), {
        ...messageObj,
        attachments: processedAttachments,
      });

      // Create notification for email sending
      await addDoc(collection(firestore, 'notifications'), {
        type: 'email_reply',
        inquiryId: inquiry.id,
        recipientEmail: inquiry.email,
        recipientName: inquiry.name,
        message: newMessage,
        attachments: processedAttachments,
        timestamp: Timestamp.now(),
        status: 'pending',
      });

      // Update the temporary message with the real ID
      setMessages(prevMessages =>
        prevMessages.map(msg => (msg.id === tempId ? { ...msg, id: replyRef.id } : msg))
      );

      // Clear the form
      setNewMessage('');
      setAttachments([]);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');

      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  // Helper function to convert file to base64
  const convertToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };
  const handleFileSelect = e => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 p-4">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="text-gray-400 hover:text-red-500">
              <FaTimes />
            </button>
            <div>
              <h3 className="font-medium text-white">{inquiry.company}</h3>
              <p className="text-sm text-gray-400">{inquiry.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {emailStatus && (
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  emailStatus === 'delivered'
                    ? 'bg-green-500/20 text-green-500'
                    : emailStatus === 'failed'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                }`}
              >
                {emailStatus === 'delivered'
                  ? 'Sent'
                  : emailStatus === 'failed'
                    ? 'Failed'
                    : 'Sending...'}
              </span>
            )}
            <button
              onClick={() => onDelete(inquiry.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Initial Inquiry */}
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <FaUser className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="rounded-lg bg-gray-700/50 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <span className="font-medium text-white">{inquiry.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(inquiry.timestamp.seconds * 1000).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300">{inquiry.jobDetails}</p>
              </div>
            </div>
          </div>

          {/* Replies */}
          {messages.map(message => (
            <div key={message.id} className="flex items-start space-x-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                <FaReply className="text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="rounded-lg bg-blue-500/20 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-medium text-white">You</span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{message.message}</p>
                  {message.attachments?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-400"
                        >
                          <FaPaperclip />
                          <span>{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-red-500/20 p-4">
          <form onSubmit={handleSendMessage} className="space-y-4">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 rounded-lg bg-gray-700/50 px-3 py-1"
                  >
                    <span className="text-sm text-gray-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <FaPaperclip />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-lg border border-red-500/20 bg-gray-700/50 p-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                rows={3}
                disabled={sending}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaReply className="mr-2" /> Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const InquiryCard = ({ inquiry, onSelect, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = timestamp => {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, 'contactSubmissions', inquiry.id));
      toast.success('Inquiry deleted successfully');
      if (onDelete) onDelete(inquiry.id);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer rounded-lg bg-gray-800/50 p-6 transition-colors hover:bg-gray-800/70"
      onClick={() => onSelect(inquiry)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{inquiry.company}</h3>
              <p className="text-sm text-gray-400">{inquiry.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  inquiry.status === 'new'
                    ? 'bg-red-500/20 text-red-500'
                    : inquiry.status === 'replied'
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {inquiry.status === 'new'
                  ? 'New'
                  : inquiry.status === 'replied'
                    ? 'Replied'
                    : 'Archived'}
              </span>
            </div>
          </div>

          {/* Preview */}
          <p className="line-clamp-2 text-sm text-gray-400">{inquiry.jobDetails}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <FaEnvelope className="mr-2 text-red-500" />
                {inquiry.email}
              </span>
              <span className="flex items-center">
                <FaClock className="mr-2 text-red-500" />
                {formatDate(inquiry.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 font-medium text-white">Confirm Delete</h3>
            <p className="mb-6 text-gray-400">
              Are you sure you want to delete this inquiry from {inquiry.company}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const EventAttendeesCard = ({ registration }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-lg bg-gray-800/50 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{registration.name}</h3>
              <p className="text-sm text-gray-400">{registration.company}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-500">
                Registered
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <p className="font-medium text-white">{registration.eventTitle}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <FaCalendar className="mr-2 text-red-500" />
                {registration.eventDate}
              </span>
              <span className="flex items-center">
                <FaClock className="mr-2 text-red-500" />
                {registration.eventTime}
              </span>
              <span className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                {registration.eventLocation}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <FaEnvelope className="mr-2 text-red-500" />
              {registration.email}
            </span>
            <span className="flex items-center">
              <FaPhone className="mr-2 text-red-500" />
              {registration.phone}
            </span>
          </div>

          {registration.additionalInfo && (
            <p className="text-sm text-gray-400">{registration.additionalInfo}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const InquiriesScreen = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, new, replied, archived
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' or 'attendees'

  useEffect(() => {
    // Create query
    const q = query(collection(firestore, 'contactSubmissions'), orderBy('timestamp', 'desc'));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const inquiriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInquiries(inquiriesData);
        setLoading(false);

        // Show notification for new inquiries
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added' && !loading) {
            toast.info('New inquiry received!', {
              position: 'bottom-right',
            });
          }
        });
      },
      error => {
        console.error('Error fetching inquiries:', error);
        toast.error('Failed to load inquiries');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = inquiryId => {
    setInquiries(prev => prev.filter(inquiry => inquiry.id !== inquiryId));
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(null);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'new'
          ? inquiry.status === 'new'
          : filter === 'replied'
            ? inquiry.status === 'replied'
            : inquiry.status === 'archived';

    return matchesSearch && matchesFilter;
  });

  const eventRegistrations = inquiries.filter(inquiry => inquiry.type === 'event_registration');
  const regularInquiries = inquiries.filter(inquiry => inquiry.type !== 'event_registration');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`rounded-lg px-4 py-2 transition-colors ${
            activeTab === 'inquiries'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          Customer Inquiries
        </button>
        <button
          onClick={() => setActiveTab('attendees')}
          className={`rounded-lg px-4 py-2 transition-colors ${
            activeTab === 'attendees'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          Event Attendees
        </button>
      </div>

      {activeTab === 'inquiries' ? (
        <div className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Customer Inquiries</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-red-500/20 bg-gray-800/50 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-500/40 focus:outline-none"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500/40 focus:outline-none"
              >
                <option value="all">All Inquiries</option>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Inquiries List */}
          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Loading inquiries...</p>
            </div>
          ) : regularInquiries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {regularInquiries.map(inquiry => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  onSelect={setSelectedInquiry}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">No inquiries found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Event Attendees</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-lg border border-red-500/20 bg-gray-800/50 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-500/40 focus:outline-none"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Loading attendees...</p>
            </div>
          ) : eventRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {eventRegistrations.map(registration => (
                <EventAttendeesCard key={registration.id} registration={registration} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">No event registrations found</p>
            </div>
          )}
        </div>
      )}

      {/* Message Thread Modal */}
      {selectedInquiry && (
        <MessageThread
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default InquiriesScreen;
