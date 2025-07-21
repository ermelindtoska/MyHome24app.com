// src/roles/CheckAdminStatus.jsx
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const CheckAdminStatus = () => {
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      user.getIdTokenResult()
        .then((idTokenResult) => {
          console.log('🟦 Is admin?', idTokenResult.claims.admin); // true nëse është admin
        })
        .catch((error) => {
          console.error('❌ Error fetching token:', error);
        });
    }
  }, []);

  return null; // ose mund të shtosh loader, mesazh, etj
};

export default CheckAdminStatus;
