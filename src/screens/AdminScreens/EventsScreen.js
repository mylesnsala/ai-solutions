import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '../../database/firebase';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, Edit, Trash2, Plus } from 'lucide-react';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'upcoming',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(firestore, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await updateDoc(doc(firestore, 'events', selectedEvent.id), formData);
        toast.success('Event updated successfully');
      } else {
        await addDoc(collection(firestore, 'events'), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success('Event created successfully');
      }
      setShowModal(false);
      setSelectedEvent(null);
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        status: 'upcoming',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = event => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      status: event.status,
    });
    setShowModal(true);
  };

  const handleDelete = async eventId => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(firestore, 'events', eventId));
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Events Management</h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              title: '',
              date: '',
              time: '',
              location: '',
              description: '',
              status: 'upcoming',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
        >
          <Plus size={20} />
          Add New Event
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div key={event.id} className="rounded-lg border border-gray-700 bg-gray-800 p-6">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-gray-400 transition-colors duration-200 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-gray-300">{event.description}</p>
              <div className="mt-4">
                <span
                  className={`rounded-full px-2 py-1 text-sm ${
                    event.status === 'upcoming'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-gray-500/20 text-gray-500'
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {selectedEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-gray-300">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-gray-300">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-gray-300">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="h-32 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-500 px-6 py-2 text-white transition-colors duration-200 hover:bg-red-600"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen;
