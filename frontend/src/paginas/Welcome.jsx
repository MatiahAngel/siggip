// 📁 UBICACIÓN: frontend/src/paginas/Welcome.jsx
// 🎯 PROPÓSITO: Página de bienvenida con accesos diferenciados por rol
// ✅ ACTUALIZADO: Ruta de login para profesores

import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  const userRoles = [
    {
      id: 'estudiante',
      title: 'Estudiantes',
      description: 'Postula a prácticas profesionales, gestiona tus informes y consulta tu progreso académico',
      icon: '🎓',
      gradient: 'from-blue-600 to-blue-700',
      hoverGradient: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      id: 'profesor',
      title: 'Profesores Guía',
      description: 'Supervisa el progreso de estudiantes, revisa informes y realiza evaluaciones de desempeño',
      icon: '👨‍🏫',
      gradient: 'from-emerald-600 to-emerald-700',
      hoverGradient: 'hover:from-emerald-700 hover:to-emerald-800'
    },
    {
      id: 'empresa',
      title: 'Empresas',
      description: 'Publica ofertas de práctica profesional y gestiona las postulaciones de estudiantes',
      icon: '🏢',
      gradient: 'from-orange-600 to-orange-700',
      hoverGradient: 'hover:from-orange-700 hover:to-orange-800'
    },
    {
      id: 'directivo',
      title: 'Administración',
      description: 'Gestiona usuarios, supervisa procesos y accede a reportes del sistema completo',
      icon: '⚙️',
      gradient: 'from-red-600 to-red-700',
      hoverGradient: 'hover:from-red-700 hover:to-red-800'
    }
  ];

  const handleRoleClick = (roleId) => {
    // Rutas específicas por rol
    if (roleId === 'estudiante') {
      navigate('/login/estudiante');
    } else if (roleId === 'profesor') {
      navigate('/login/profesor');
    } else if (roleId === 'empresa') {
      navigate('/login/empresa');
    } else {
      navigate('/login', { state: { userType: roleId } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo + Nombre */}
          <div className="flex items-center space-x-4">
            <img 
              src="/logo-liceo.jpg" 
              alt="Logo Liceo" 
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SIGGIP</h1>
              <p className="text-xs text-gray-600">Sistema Integral de Gestión de Prácticas</p>
            </div>
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            onClick={() => {
              // Scroll suave a la sección de selección de perfil
              document.getElementById('selector-perfil')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Acceder al Sistema
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestiona tus Prácticas Profesionales de forma Digital
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Plataforma integral para estudiantes, profesores y empresas del Liceo Polivalente Padre José Herde Pohler
            </p>
            <button
              onClick={() => {
                // Scroll suave a la sección de selección de perfil
                document.getElementById('selector-perfil')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition-colors shadow-xl"
            >
              Seleccionar mi Perfil
            </button>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Sección de Accesos */}
      <section id="selector-perfil" className="py-16 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Quién eres?
            </h2>
            <p className="text-lg text-gray-600">
              Selecciona tu perfil para continuar al sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {userRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleClick(role.id)}
                className={`bg-gradient-to-br ${role.gradient} ${role.hoverGradient} rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div className="text-5xl mb-4">{role.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  {role.description}
                </p>
                <div className="flex items-center text-white font-semibold">
                  <span>Ingresar</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios del Sistema */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué usar SIGGIP?
            </h2>
            <p className="text-lg text-gray-600">
              Una plataforma diseñada para optimizar todo el proceso de prácticas profesionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proceso Simplificado</h3>
              <p className="text-gray-600">
                Automatiza la gestión desde la postulación hasta la evaluación final, ahorrando tiempo y reduciendo errores
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seguro y Confiable</h3>
              <p className="text-gray-600">
                Protección de datos con control de acceso por roles y respaldo automático de toda la información
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reportes en Tiempo Real</h3>
              <p className="text-gray-600">
                Accede a métricas y estadísticas actualizadas para una mejor toma de decisiones institucionales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 SIGGIP - Todos los derechos reservados</p>
              <p className="text-sm text-gray-400">Liceo Polivalente Padre José Herde Pohler - Canela</p>
            </div>
            <div className="text-sm text-gray-400">
              Desarrollado como proyecto de titulación
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}