// 📁 UBICACIÓN: frontend/src/paginas/autenticacion/LoginEmpresas.jsx
// 🎯 PROPÓSITO: Login de empresas por RUT con tema naranjo

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginEmpresas() {
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  // ============================================
  // FORMATEAR RUT MIENTRAS ESCRIBE (EMPRESA)
  // ============================================
  const formatRut = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();

    if (cleaned.length === 0) return '';
    if (cleaned.length === 1) return cleaned;

    const dv = cleaned.slice(-1);
    const numbers = cleaned.slice(0, -1);

    if (numbers.length === 0) return dv;

    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formatted}-${dv}`;
  };

  // ============================================
  // VALIDAR DÍGITO VERIFICADOR DEL RUT (EMPRESA)
  // ============================================
  const validateRutDigit = (rut) => {
    const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    if (cleaned.length < 2) return false;

    const dv = cleaned.slice(-1);
    const numbers = cleaned.slice(0, -1);

    if (!/^\d+$/.test(numbers)) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = numbers.length - 1; i >= 0; i--) {
      sum += parseInt(numbers[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv =
      expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);

    return dv === calculatedDv;
  };

  // ============================================
  // LIMPIAR RUT (quitar puntos y guion)
  // ============================================
  const cleanRut = (rut) => {
    return rut.replace(/\./g, '').replace(/-/g, '');
  };

  // ============================================
  // MANEJAR CAMBIO EN INPUT DE RUT EMPRESA
  // ============================================
  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setRutEmpresa(formatted);

    if (errors.rutEmpresa) {
      setErrors({ ...errors, rutEmpresa: '' });
    }
  };

  // ============================================
  // VALIDAR FORMULARIO
  // ============================================
  const validateForm = () => {
    const newErrors = {};

    if (!rutEmpresa.trim()) {
      newErrors.rutEmpresa = 'El RUT de la empresa es requerido';
    } else if (!validateRutDigit(rutEmpresa)) {
      newErrors.rutEmpresa = 'RUT de empresa inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const rutLimpio = cleanRut(rutEmpresa); // el backend espera en el campo "email"
      const result = await login(rutLimpio, password);
      if (result?.success) {
        if (result.user?.tipo_usuario === 'empresa') {
          navigate('/empresa/dashboard');
        } else {
          setError('Este acceso es solo para empresas');
        }
      } else {
        setError(result?.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-md w-full">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h3V9h6v10h3a2 2 0 002-2V7a2 2 0 00-2-2h-3V3H8v2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SIGGIP</h1>
          <p className="text-gray-600">Acceso Empresas</p>
          <div className="mt-3 inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">🏢 Portal Empresas</div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* RUT Empresa */}
            <div>
              <label htmlFor="rutEmpresa" className="block text-sm font-semibold text-gray-700 mb-2">RUT Empresa</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5" />
                  </svg>
                </div>
                <input
                  id="rutEmpresa"
                  type="text"
                  value={rutEmpresa}
                  onChange={handleRutChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.rutEmpresa ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
                  placeholder="12.345.678-9"
                  disabled={loading}
                  maxLength={12}
                />
              </div>
              {/* Validación desactivada para pruebas */}
              <p className="mt-2 text-xs text-gray-500">Ingresa el RUT de la empresa (se formatea automáticamente).</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                  aria-label="Mostrar/Ocultar contraseña"
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
              {/* Validación desactivada para pruebas */}
              <p className="mt-2 text-xs text-gray-500">Si no tienes contraseña, solicita una o usa la definida al crear la empresa.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 px-4 rounded-xl hover:from-orange-700 hover:to-amber-700 focus:ring-4 focus:ring-orange-300 font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
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

          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              ¿Eres estudiante?{' '}
              <Link to="/login/estudiante" className="text-orange-600 hover:text-orange-800 font-semibold transition-colors">
                Ir al acceso estudiantes
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">© 2025 SIGGIP - Todos los derechos reservados</p>
      </div>
    </div>
  );
}
