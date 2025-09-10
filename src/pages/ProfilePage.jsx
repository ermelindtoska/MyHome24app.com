// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProfilePage = () => {
  const { t } = useTranslation('profile');
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    profilePicture: '',
    role: 'user',
    listings: [],
    messages: []
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        // Get user data from Firebase Auth
        setUserData(prev => ({
          ...prev,
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          profilePicture: currentUser.photoURL || ''
        }));

        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prev => ({
            ...prev,
            dateOfBirth: data.dateOfBirth || '',
            role: data.role || 'user',
            listings: data.listings || [],
            messages: data.messages || []
          }));
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const stats = {
    totalListings: userData.listings.length,
    published: userData.listings.filter(l => l.status === 'published').length,
    pending: userData.listings.filter(l => l.status === 'pending').length,
    rejected: userData.listings.filter(l => l.status === 'rejected').length
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      
      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('userInfo')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('name')}</label>
            <input
              type="text"
              value={userData.displayName}
              disabled
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('email')}</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={userData.phoneNumber}
              disabled
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('dateOfBirth')}</label>
            <input
              type="date"
              value={userData.dateOfBirth}
              disabled
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('role')}</label>
            <div className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-center">
              {userData.role === 'user' && t('user')}
              {userData.role === 'owner' && t('owner')}
              {userData.role === 'agent' && t('agent')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('profilePicture')}</label>
            <input
              type="url"
              value={userData.profilePicture}
              disabled
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('stats')}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.totalListings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalListings')}</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.published}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('published')}</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('pending')}</div>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.rejected}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('rejected')}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('messages')}</h2>
        
        {userData.messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('noMessages')}
          </div>
        ) : (
          <div className="space-y-4">
            {userData.messages.map((msg, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{msg.sender}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{msg.timestamp}</div>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:underline">Reply</button>
                </div>
                <div className="mt-2 text-gray-800 dark:text-gray-200">{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;