import { useCallback, useState } from 'react';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gigforge_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gigforge_token'));

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('gigforge_token', jwt);
    localStorage.setItem('gigforge_role', userData?.role || '');
    localStorage.setItem('gigforge_user', JSON.stringify(userData));
  };

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(updates || {}) };
      localStorage.setItem('gigforge_user', JSON.stringify(next));
      if (next.role != null) localStorage.setItem('gigforge_role', String(next.role));
      return next;
    });
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gigforge_token');
    localStorage.removeItem('gigforge_role');
    localStorage.removeItem('gigforge_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
