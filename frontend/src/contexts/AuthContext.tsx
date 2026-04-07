import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  hasRequiredRole: (requiredRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          // Decode JWT payload (basic)
          const payload = token.split('.')[1];
          if (payload) {
            const decodedUser = JSON.parse(atob(payload));
            setUser({ id: decodedUser.id, email: decodedUser.email, rol: decodedUser.rol });
          }
        } catch (error) {
          console.error("Error decoding token or invalid token:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // Note: In a real app, this would call the API. 
      // For now, we'll assume the API utility handles the actual request.
      // This is a placeholder that matches the logic provided.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const hasRequiredRole = (requiredRoles: string[]) => {
    if (!user || !user.rol) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.rol);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    hasRequiredRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
