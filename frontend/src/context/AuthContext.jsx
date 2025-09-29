// 📁 UBICACIÓN: frontend/src/context/AuthContext.jsx
// 🎯 PROPÓSITO: Manejo global de autenticación y usuario logueado

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../servicios/api/cliente';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Cargar usuario desde localStorage al iniciar la app
 useEffect(() => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  } catch (error) {
    console.error('Error cargando usuario:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  setLoading(false);
}, []);

  // Función de LOGIN
  const login = async (email, password) => {
    try {
      // Usando tu cliente API existente
      const { data } = await api.post('/auth/login', { email, password });

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      setToken(data.token);
      setUser(data.usuario);

      return { success: true, user: data.usuario };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  // Función de LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Verificar si tiene un rol específico
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.tipo_usuario);
    }
    return user.tipo_usuario === roles;
  };

  // Actualizar usuario (útil después de editar perfil)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};