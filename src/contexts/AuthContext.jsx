import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { defaultMembers } from '../utils/dummyData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [user]);

  const login = (username, password) => {
    const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
    const allUsers = members.length > 0 ? members : defaultMembers;
    
    const found = allUsers.find(
      (m) => m.username === username && m.password === password
    );

    if (found) {
      const userData = {
        id: found.id,
        name: found.name,
        username: found.username,
        role: found.role,
        mobile: found.mobile,
      };
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isAdmin: user?.role === 'admin', isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
