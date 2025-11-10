// src/utils/roles.js
export function getStartPathForRole(role) {
  switch ((role || '').toLowerCase()) {
    case 'admin':  return '/admin';
    case 'owner':  return '/owner';
    case 'agent':  return '/agent';
    case 'user':   return '/';
    default:       return '/';
  }
}
