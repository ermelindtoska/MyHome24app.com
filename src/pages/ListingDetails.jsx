// ListingDetails.jsx – përfshin statistika për pronarin dhe chat realtime

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import ContactOwnerChat from "../components/ContactOwnerChat";
import { auth } from '../firebase-config';

const ListingDetails = () => {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [listing, setListing] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState('');
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalRatings: 0, totalReports: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setListing(docSnap.data());

      const commentQuery = query(collection(db, 'comments'), where('listingId', '==', id));
      const commentSnap = await getDocs(commentQuery);
      setComments(commentSnap.docs.map(doc => doc.data()));

      const ratingsSnap = await getDocs(query(collection(db, 'ratings'), where('listingId', '==', id)));
      const ratings = ratingsSnap.docs.map(doc => doc.data().rating);
      const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

      const reportsSnap = await getDocs(query(collection(db, 'reports'), where('listingId', '==', id)));

      setStats({
        avgRating,
        totalRatings: ratings.length,
        totalReports: reportsSnap.size
      });
    };
    fetchData();
  }, [id]);

  const handleRating = async (value) => {
    setRating(value);
    await addDoc(collection(db, 'ratings'), {
      listingId: id,
      userId: user?.uid || 'guest',
      rating: value,
      createdAt: serverTimestamp()
    });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addDoc(collection(db, 'comments'), {
      listingId: id,
      userId: user?.uid || 'guest',
      text: comment,
      createdAt: serverTimestamp()
    });
    setComments(prev => [...prev, { userId: user?.uid || 'guest', text: comment }]);
    setComment('');
  };

  const handleReport = async () => {
    if (!report.trim()) return;
    await addDoc(collection(db, 'reports'), {
      listingId: id,
      userId: user?.uid || 'guest',
      reason: report,
      createdAt: serverTimestamp()
    });
    setReport('');
    alert('Listing reported');
  };

  if (!listing) return <div className="p-6 text-center">Loading listing...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p>{listing.city} – €{listing.price}</p>

      {user?.uid === listing.userId && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">📊 Your Listing Stats</h3>
          <p>Average Rating: <strong>{stats.avgRating}</strong> ({stats.totalRatings} votes)</p>
          <p>Total Comments: <strong>{comments.length}</strong></p>
          <p>Total Reports: <strong>{stats.totalReports}</strong></p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold">⭐ Rate this listing</h3>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={star <= rating ? 'text-yellow-500 text-2xl' : 'text-gray-400 text-2xl'}
            onClick={() => handleRating(star)}
          >★</button>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Leave a comment</h3>
        <form onSubmit={handleComment} className="flex flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 rounded"
            placeholder="Your comment..."
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
        </form>
        {comments.length > 0 && (
          <ul className="mt-4 space-y-2">
            {comments.map((c, i) => (
              <li key={i} className="border p-2 rounded"><strong>{c.userId}</strong>: {c.text}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 💬 CHAT REALTIME ME PRONARIN */}
      <ContactOwnerChat listingId={id} ownerId={listing.userId} />

      <div className="mt-6">
        <h3 className="text-lg font-semibold">🚨 Report Listing</h3>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          placeholder="Why are you reporting this listing?"
        />
        <button onClick={handleReport} className="bg-red-600 text-white px-4 py-2 rounded">Report</button>
      </div>
    </div>
  );
};

export default ListingDetails;
