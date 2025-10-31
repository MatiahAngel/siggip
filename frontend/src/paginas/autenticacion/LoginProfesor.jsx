// 📁 frontend/src/paginas/autenticacion/LoginProfesor.jsx
// Login exclusivo para profesores con email

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginProfesor() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Verificar que sea profesor
        if (result.user.tipo_usuario === 'profesor') {
          navigate('/profesor/dashboard');
        } else {
          setError('Este acceso es solo para profesores');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-md w-full">
        {/* Header con Logo */}
        <div className="text-center mb-8">
          {/* Icono de Profesor */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SIGGIP</h1>
          <div className="inline-block">
            <p className="text-lg font-bold text-green-700 mb-1">Portal Profesores</p>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Acceso exclusivo para profesores guía</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border-2 border-green-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  placeholder="profesor@liceo.cl"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <button className="text-sm text-green-700 hover:text-green-800 font-semibold hover:underline transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                ¿No eres profesor?{' '}
                <Link
                  to="/"
                  className="text-green-700 hover:text-green-800 font-semibold hover:underline"
                >
                  Volver al inicio
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 SIGGIP - Liceo Polivalente Padre José Herde Pohler
        </p>
      </div>
    </div>
  );
}