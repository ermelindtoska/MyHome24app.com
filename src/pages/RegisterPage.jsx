import React from 'react';
import RegisterForm from '../pages/RegisterForm';
import { Helmet } from 'react-helmet';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';


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
