import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function RegisterSuccess() {
  const { state } = useLocation();
  const email = state?.email;
  const [msg, setMsg] = useState('');

  const resend = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMsg('Verification email sent again.');
      } else {
        setMsg('Please sign in to resend the verification email.');
      }
    } catch (e) {
      console.error(e);
      setMsg(e.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="mb-4">
        We sent a verification link to <b>{email || 'your inbox'}</b>. 
        Please check Spam/Junk too.
      </p>
      <button onClick={resend} className="px-4 py-2 rounded bg-blue-600 text-white">
        Resend email
      </button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
