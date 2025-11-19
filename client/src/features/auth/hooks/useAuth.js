import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * Safe to use even before AuthProvider is mounted
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return safe defaults if used before AuthProvider is mounted
  if (!context) {
    return {
      user: null,
      loading: true,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };
  }
  
  return context;
};
