import React from 'react';
import { Helmet } from 'react-helmet';

const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <Helmet>
        <title>About – MyHome24app</title>
        <meta name="description" content="Learn more about MyHome24app, the real estate platform for Germany." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">About MyHome24app</h1>
      <p className="mb-4">
        MyHome24app is a modern platform dedicated to helping people across Germany find and manage real estate listings
        with ease. Whether you are searching for an apartment to rent or looking to list your home for sale, we provide
        the tools and visibility you need.
      </p>
      <p className="mb-4">
        Our mission is to make real estate easy, transparent, and accessible for everyone. With advanced features like
        search filters, listing favorites, direct messaging, and account dashboards, MyHome24app delivers an intuitive
        experience that puts users first.
      </p>
      <p className="mb-4">
        We’re continuously improving and welcome your feedback to make our platform even better.
      </p>

      <p className="text-sm text-gray-500 mt-6">© {new Date().getFullYear()} MyHome24app. All rights reserved.</p>
    </div>
  );
};

export default AboutPage;
