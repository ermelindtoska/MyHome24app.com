import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const RegisterSuccess = () => {
  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow rounded text-center">
      <Helmet>
        <title>Registration Successful – MyHome24app</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-4 text-green-600">Registration Successful 🎉</h1>
      <p className="mb-4 text-gray-700">
        Thank you for creating an account with MyHome24app. A confirmation email has been sent to your inbox.
      </p>
      <p className="mb-6 text-gray-600">
        Please verify your email to activate your account. Once verified, you can log in.
      </p>
      <Link to="/login" className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
        Go to Login
      </Link>
    </div>
  );
};

export default RegisterSuccess;
