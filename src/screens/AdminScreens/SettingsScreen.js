import React, { useState, useEffect } from 'react';
import { FaUser, FaBell, FaLock, FaPalette, FaGlobe, FaDatabase, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { firestore } from '../../database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    country: '',
    language: 'en',
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      updates: true,
    },
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const adminDoc = await getDoc(doc(firestore, 'admin', 'MnhVNo3vewn7R7ucOeSf'));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setFormData(prev => ({
          ...prev,
          firstname: adminData.firstname || '',
          lastname: adminData.lastname || '',
          email: adminData.email || '',
          phonenumber: adminData.phonenumber || '',
          country: adminData.country || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateDoc(doc(firestore, 'admin', 'admin'), {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        country: formData.country,
        updatedAt: new Date(),
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'profile', icon: FaUser, label: 'Profile' },
    { id: 'notifications', icon: FaBell, label: 'Notifications' },
    { id: 'security', icon: FaLock, label: 'Security' },
    { id: 'appearance', icon: FaPalette, label: 'Appearance' },
    { id: 'language', icon: FaGlobe, label: 'Language' },
    { id: 'data', icon: FaDatabase, label: 'Data Management' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="flex space-x-4 border-b border-red-500/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-2 pb-4 ${
                activeTab === tab.id
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-red-500" />
                </div>
              ) : (
                <>
                  {/* User Details Card */}
                  <div className="rounded-lg border border-red-500/20 bg-gray-800/50 p-6">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                        <FaUser className="text-2xl text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {formData.firstname} {formData.lastname}
                        </h2>
                        <p className="text-gray-400">{formData.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="font-medium text-gray-300">Phone:</span>
                          {formData.phonenumber}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="font-medium text-gray-300">Country:</span>
                          {formData.country}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-red-500/20 pt-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Edit Profile</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium text-gray-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phonenumber"
                        value={formData.phonenumber}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium text-gray-300">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="email"
                    checked={formData.notifications.email}
                    onChange={handleInputChange}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-400">Receive push notifications</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="push"
                    checked={formData.notifications.push}
                    onChange={handleInputChange}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Theme</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          )}

          {/* Language Settings */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-red-500/20 bg-gray-800/50 px-4 py-2 text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          )}

          {/* Data Management Settings */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <h3 className="mb-2 font-medium text-white">Export Data</h3>
                <p className="mb-4 text-sm text-gray-400">
                  Download all your data in a portable format
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-red-500/20 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/30"
                >
                  Export Data
                </button>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <h3 className="mb-2 font-medium text-white">Delete Account</h3>
                <p className="mb-4 text-sm text-gray-400">
                  Permanently delete your account and all associated data
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsScreen;
