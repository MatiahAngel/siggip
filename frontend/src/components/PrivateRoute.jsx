// 📁 UBICACIÓN: frontend/src/components/PrivateRoute.jsx
// 🎯 PROPÓSITO: Proteger rutas según autenticación y roles

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a welcome
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const hasPermission = allowedRoles.includes(user?.tipo_usuario);

    if (!hasPermission) {
      // Página de acceso denegado
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Tu rol actual: <span className="font-semibold">{user?.tipo_usuario}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver atrás
            </button>
          </div>
        </div>
      );
    }
  }

  // Si pasa todas las verificaciones, mostrar el componente hijo
  return children;
};

export default PrivateRoute;