// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {
  const { t } = useTranslation('profile');
  const { currentUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [tempData, setTempData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(null);

  // Fetch user data (Firestore has priority, Auth is fallback)
  const fetchUserData = async () => {
    try {
      if (!currentUser) {
        setError(t('error.noUser'));
        setLoading(false);
        return;
      }

      const authData = {
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        photoURL: currentUser.photoURL || '',
      };

      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      const firestoreData = snap.exists() ? snap.data() : {};

      const combinedData = {
        displayName: firestoreData.displayName ?? authData.displayName ?? '',
        email: authData.email,
        phoneNumber: firestoreData.phoneNumber ?? authData.phoneNumber ?? '',
        photoURL: firestoreData.photoURL ?? authData.photoURL ?? '',
        dateOfBirth: firestoreData.dateOfBirth ?? '',
        role: firestoreData.role ?? 'user',
        listings: firestoreData.listings ?? [],
        messages: firestoreData.messages ?? [],
      };

      setUserData(combinedData);
      setTempData(combinedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(t('error.fetchingData'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser, t]);

  const stats = userData
    ? {
        totalListings: userData.listings.length,
        published: userData.listings.filter((l) => l.status === 'published').length,
        pending: userData.listings.filter((l) => l.status === 'pending').length,
        rejected: userData.listings.filter((l) => l.status === 'rejected').length,
      }
    : { totalListings: 0, published: 0, pending: 0, rejected: 0 };

  const validateForm = () => {
    const newErrors = {};
    if (!tempData.displayName?.trim()) newErrors.displayName = t('error.nameRequired');

    if (tempData.dateOfBirth) {
      const birthDate = new Date(tempData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) newErrors.dateOfBirth = t('error.futureDate');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = () => {
    setEditing(!editing);
    if (!editing) setTempData(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  // Resumable upload to Firebase Storage
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert(t('error.unsupportedImageType') || 'Unsupported image type. Use JPG/PNG/WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('error.imageTooLarge') || 'Image is larger than 5 MB.');
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `users/${currentUser.uid}/avatar_${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);

    // Adding metadata can help with certain proxies inspecting uploads
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=3600',
    };

    console.log('[Storage] start resumable upload ->', path, file.type, file.size);
    const task = uploadBytesResumable(storageRef, file, metadata);
    setUploadProgress(0);

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploadProgress(pct);
        console.log(
          '[Storage] state:',
          snap.state,
          pct + '%',
          `${snap.bytesTransferred}/${snap.totalBytes}`
        );
      },
      (err) => {
        setUploadProgress(null);
        console.error('[Storage] resumable upload error:', err);
        const msg =
          (err && err.message) || t('error.uploadFailed') || 'Upload failed.';
        alert(msg);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          console.log('[Storage] downloadURL:', url);
          setTempData((prev) => ({ ...prev, photoURL: url }));
          setUploadProgress(null);
        } catch (e) {
          console.error('[Storage] getDownloadURL error:', e);
          setUploadProgress(null);
          alert('Could not get the file URL after upload.');
        }
      }
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);

      // Guard: don't allow data URLs to slip into Firestore
      if (
        typeof tempData.photoURL === 'string' &&
        tempData.photoURL.startsWith('data:')
      ) {
        alert('The photo has not finished uploading yet. Please wait.');
        return;
      }

      const updateData = {
        displayName: tempData.displayName || '',
        phoneNumber: tempData.phoneNumber || '',
        dateOfBirth: tempData.dateOfBirth || '',
        role: tempData.role || 'user',
        photoURL: tempData.photoURL || '',
      };

      await setDoc(userRef, updateData, { merge: true });

      // Optional but useful: update Firebase Auth profile too (e.g., navbar avatar)
      try {
        await updateProfile(currentUser, {
          displayName: updateData.displayName || currentUser.displayName || '',
          photoURL: updateData.photoURL || null,
        });
      } catch (e) {
        console.warn('Auth profile update failed (non-blocking):', e);
      }

      await fetchUserData();
      setEditing(false);
      alert(`${t('saveChanges')} ${t('success')}`);
    } catch (err) {
      console.error('🔥 Firestore Save Error:', err);
      if (err.code === 'permission-denied') {
        alert(t('error.permissionDenied'));
      } else if (err.code === 'unavailable') {
        alert(t('error.networkError'));
      } else {
        alert(t('error.saveFailed'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-md text-center">
          <span className="block">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t('title')}</h1>
          </div>
          <button
            onClick={handleEditClick}
            className="px-5 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-all duration-300 backdrop-blur-sm font-medium"
          >
            {editing ? t('cancel') : t('editProfile')}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-8 animate-fade-in">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
            {t('userInfo')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('name')}
              </label>
              <input
                type="text"
                name="displayName"
                value={editing ? tempData.displayName : userData.displayName}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition ${
                  editing
                    ? 'border-blue-500 bg-white dark:bg-gray-700'
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-700'
                } ${errors.displayName ? 'border-red-500' : ''}`}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <input
                type="email"
                value={userData.email}
                disabled
                className="w-full p-3.5 border border-gray-300 rounded-xl bg-gray-100 dark:bg-gray-700"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('phone')}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={editing ? tempData.phoneNumber : userData.phoneNumber}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition ${
                  editing
                    ? 'border-blue-500 bg-white dark:bg-gray-700'
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-700'
                }`}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('dateOfBirth')}
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={editing ? tempData.dateOfBirth : userData.dateOfBirth}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition ${
                  editing
                    ? 'border-blue-500 bg-white dark:bg-gray-700'
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-700'
                } ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('role')}
              </label>
              <select
                name="role"
                value={editing ? tempData.role : userData.role}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition ${
                  editing
                    ? 'border-blue-500 bg-white dark:bg-gray-700'
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <option value="user">{t('user')}</option>
                <option value="owner">{t('owner')}</option>
                <option value="agent">{t('agent')}</option>
              </select>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('profilePicture')}
              </label>
              {editing ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profilePictureUpload"
                  />
                  <button
                    onClick={() =>
                      document.getElementById('profilePictureUpload').click()
                    }
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t('uploadPhoto')}
                  </button>
                  {uploadProgress !== null && (
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  )}
                  {tempData.photoURL && (
                    <img
                      src={tempData.photoURL}
                      alt="Profile Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                  )}
                </div>
              ) : (
                <div>
                  <img
                    src={userData.photoURL || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {editing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={handleEditClick}
                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-xl transition-all duration-200 font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              >
                {t('saveChanges')}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-green-600 dark:text-green-400">
            {t('stats')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                {stats.totalListings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('totalListings')}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                {stats.published}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('published')}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('pending')}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-red-600 dark:text-red-300">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('rejected')}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-purple-600 dark:text-purple-400">
            {t('messages')}
          </h2>
          {userData.messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-lg">{t('noMessages')}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {userData.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-purple-700 dark:text-purple-300 text-sm md:text-base">
                        {msg.sender}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {msg.timestamp}
                      </div>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                      Reply
                    </button>
                  </div>
                  <div className="mt-3 text-gray-800 dark:text-gray-200 leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
