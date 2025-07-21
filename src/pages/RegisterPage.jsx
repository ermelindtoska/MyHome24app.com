import React from 'react';
import RegisterForm from '../pages/RegisterForm';
import { Helmet } from 'react-helmet';

const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Registrieren – MyHome24app</title>
      </Helmet>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
