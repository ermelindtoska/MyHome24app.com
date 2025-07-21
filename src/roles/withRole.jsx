import React from 'react';
import { useRole } from './RoleContext';

const withRole = (Component, allowedRoles = []) => {
  return props => {
    const { role, loading } = useRole();

    if (loading) return <p>Loading...</p>;

    if (!allowedRoles.includes(role)) {
      return <p>You do not have permission to view this content.</p>;
    }

    return <Component {...props} />;
  };
};

export default withRole;
