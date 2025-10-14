// 📁 Dashboard Estudiante - Completo con todas las funcionalidades
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../servicios/api/estudiantesService';

export default function DashboardEstudiante() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [practicas, setPracticas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [informes, setInformes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos básicos que ya existen en tu backend
      const [resPerfil, resEstadisticas, resPracticas, resPostulaciones, resOfertas] = await Promise.all([
        api.get('/v1/estudiantes/perfil'),
        api.get('/v1/estudiantes/estadisticas'),
        api.get('/v1/estudiantes/mis-practicas'),
        api.get('/v1/estudiantes/mis-postulaciones'),
        api.get('/v1/estudiantes/ofertas-disponibles')
      ]);
      
      setPerfil(resPerfil.data);
      setEstadisticas(resEstadisticas.data);
      setPracticas(resPracticas.data || []);
      setPostulaciones(resPostulaciones.data || []);
      setOfertas(resOfertas.data || []);
      
      // Intentar cargar informes y notificaciones si existen (opcional)
      try {
        const resInformes = await api.get('/v1/estudiantes/mis-informes');
        setInformes(resInformes.data || []);
      } catch (err) {
        console.log('Endpoint de informes no disponible aún');
        setInformes([]);
      }
      
      try {
        const resNotificaciones = await api.get('/v1/estudiantes/notificaciones');
        setNotificaciones(resNotificaciones.data || []);
      } catch (err) {
        console.log('Endpoint de notificaciones no disponible aún');
        setNotificaciones([]);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/welcome';
  };

  const marcarNotificacionLeida = async (idNotificacion) => {
    try {
      await api.put(`/v1/estudiantes/notificaciones/${idNotificacion}/leer`);
      setNotificaciones(prev => prev.map(n => 
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      ));
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const practicaActual = practicas.find(p => p.estado_practica === 'en_curso' || p.estado_practica === 'asignada');
  const calcularProgreso = (practica) => {
    if (!practica || !practica.horas_requeridas) return 0;
    return Math.min(Math.round((practica.horas_completadas / practica.horas_requeridas) * 100), 100);
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-bold text-gray-900">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error al cargar</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={cargarDatos} className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Top Navbar Moderno */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">SIGGIP</h1>
                <p className="text-xs text-gray-600">Portal Estudiante</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink icon="🏠" label="Inicio" active={activeSection === 'inicio'} onClick={() => setActiveSection('inicio')} />
              <NavLink icon="💼" label="Prácticas" active={activeSection === 'practicas'} onClick={() => setActiveSection('practicas')} />
              <NavLink icon="📝" label="Informes" active={activeSection === 'informes'} onClick={() => setActiveSection('informes')} />
              <NavLink icon="🔍" label="Buscar" active={activeSection === 'buscar'} onClick={() => setActiveSection('buscar')} />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  <span className="text-2xl">🔔</span>
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{notificacionesNoLeidas}</span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">Notificaciones</h3>
                      <p className="text-xs text-gray-600">{notificacionesNoLeidas} sin leer</p>
                    </div>
                    {notificaciones.length > 0 ? (
                      notificaciones.map(notif => (
                        <NotificacionItem 
                          key={notif.id_notificacion} 
                          notificacion={notif}
                          onMarcarLeida={marcarNotificacionLeida}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <span className="text-4xl">📭</span>
                        <p className="text-sm text-gray-600 mt-2">Sin notificaciones</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{perfil?.nombre?.charAt(0)}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-900">{perfil?.nombre}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-bold text-gray-900">{perfil?.nombre} {perfil?.apellido_paterno}</p>
                      <p className="text-sm text-gray-600">{perfil?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{perfil?.nombre_especialidad}</p>
                    </div>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                      <span>👤</span> Mi Perfil
                    </button>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                      <span>⚙️</span> Configuración
                    </button>
                    <button onClick={handleLogout} className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3">
                      <span>🚪</span> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <MobileNavLink icon="🏠" label="Inicio" onClick={() => { setActiveSection('inicio'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="💼" label="Prácticas" onClick={() => { setActiveSection('practicas'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="📝" label="Informes" onClick={() => { setActiveSection('informes'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="🔍" label="Buscar" onClick={() => { setActiveSection('buscar'); setShowMobileMenu(false); }} />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sección: Inicio */}
        {activeSection === 'inicio' && (
          <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTYtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-full">
                    <p className="text-white font-bold text-sm">👋 Bienvenido de nuevo</p>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  ¡Hola, {perfil?.nombre}!
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  {perfil?.nombre_especialidad} • {perfil?.nivel_academico}
                </p>

                {/* Quick Stats - 5 KPIs según documentación */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <QuickStat icon="💼" value={estadisticas?.practicas_en_curso || 0} label="En Curso" />
                  <QuickStat icon="⏱️" value={estadisticas?.horas_completadas || 0} label="Horas" />
                  <QuickStat icon="📨" value={estadisticas?.postulaciones_activas || 0} label="Postulaciones" />
                  <QuickStat icon="📋" value={estadisticas?.informes_aprobados || 0} label="Informes OK" />
                  <QuickStat icon="🏆" value={estadisticas?.practicas_completadas || 0} label="Completadas" />
                </div>
              </div>
            </div>

            {/* Dashboard de KPIs Detallado */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-2xl font-black text-gray-900 mb-6">📊 Mis Indicadores</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <KPICard
                  titulo="Cobertura de Prácticas"
                  valor={`${estadisticas?.practicas_en_curso || 0}/${estadisticas?.practicas_requeridas || 1}`}
                  porcentaje={Math.round(((estadisticas?.practicas_en_curso || 0) / (estadisticas?.practicas_requeridas || 1)) * 100)}
                  color="blue"
                  icono="📊"
                />
                <KPICard
                  titulo="Informes Validados"
                  valor={`${estadisticas?.informes_aprobados || 0}/3`}
                  porcentaje={Math.round(((estadisticas?.informes_aprobados || 0) / 3) * 100)}
                  color="purple"
                  icono="📝"
                />
                <KPICard
                  titulo="Tasa de Aceptación"
                  valor={`${estadisticas?.tasa_aceptacion || 0}%`}
                  porcentaje={estadisticas?.tasa_aceptacion || 0}
                  color="emerald"
                  icono="✅"
                />
              </div>
            </div>

            {/* Práctica Actual */}
            {practicaActual ? (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold mb-1">TU PRÁCTICA ACTUAL</p>
                      <h3 className="text-2xl font-black text-white">{practicaActual.titulo_oferta}</h3>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">💼</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🏢</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Empresa</p>
                          <p className="font-bold text-gray-900">{practicaActual.empresa_nombre}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <InfoCard icon="📅" label="Inicio" value={new Date(practicaActual.fecha_inicio_practica).toLocaleDateString('es-CL')} />
                        <InfoCard icon="🎯" label="Término" value={new Date(practicaActual.fecha_termino_practica).toLocaleDateString('es-CL')} />
                      </div>

                      {practicaActual.profesor_nombre && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                          <p className="text-xs text-gray-600 font-semibold mb-1">PROFESOR GUÍA</p>
                          <p className="font-bold text-gray-900">{practicaActual.profesor_nombre} {practicaActual.profesor_apellido}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-48 h-48 mb-6">
                        <svg className="transform -rotate-90 w-48 h-48">
                          <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                          <circle cx="96" cy="96" r="88" stroke="url(#grad1)" strokeWidth="12" fill="none" strokeDasharray={`${calcularProgreso(practicaActual) * 5.53} 553`} strokeLinecap="round" />
                          <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-gray-900">{calcularProgreso(practicaActual)}%</span>
                          <span className="text-sm text-gray-600 font-semibold mt-1">Progreso</span>
                        </div>
                      </div>

                      <p className="text-center text-gray-600">
                        <span className="font-bold text-gray-900">{practicaActual.horas_completadas}</span> de{' '}
                        <span className="font-bold text-gray-900">{practicaActual.horas_requeridas}</span> horas
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => setActiveSection('practicas')}
                      className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                    >
                      📋 Ver Detalles
                    </button>
                    <button 
                      onClick={() => setActiveSection('informes')}
                      className="px-6 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      📤 Subir Informe
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex-1">
                    <div className="inline-flex px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-4">
                      <span className="font-bold text-sm">🚀 ¡Comienza ahora!</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-3">Encuentra tu práctica profesional</h3>
                    <p className="text-xl text-emerald-100 mb-6">Explora ofertas y postula a la que mejor se ajuste a tu perfil</p>
                    <button 
                      onClick={() => setActiveSection('buscar')}
                      className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition shadow-xl"
                    >
                      Ver Ofertas Disponibles →
                    </button>
                  </div>
                  <div className="text-9xl opacity-20">🎯</div>
                </div>
              </div>
            )}

            {/* Ofertas y Postulaciones */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Ofertas */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Ofertas Disponibles</h3>
                    <p className="text-gray-600">{ofertas.length} oportunidades</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('buscar')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition text-sm"
                  >
                    Ver Todas →
                  </button>
                </div>

                <div className="space-y-4">
                  {ofertas.slice(0, 4).map(oferta => (
                    <OfertaCard key={oferta.id_oferta} oferta={oferta} />
                  ))}
                </div>
              </div>

              {/* Postulaciones */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Mis Postulaciones</h3>
                <div className="space-y-3">
                  {postulaciones.length > 0 ? (
                    postulaciones.slice(0, 5).map(post => (
                      <PostulacionCard key={post.id_postulacion} postulacion={post} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">📭</div>
                      <p className="font-semibold text-gray-900">Sin postulaciones</p>
                      <p className="text-sm text-gray-600">Postula a una oferta</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sección: Informes */}
        {activeSection === 'informes' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900">📝 Mis Informes</h2>
                <p className="text-gray-600">Gestiona tus informes de práctica (máximo 3)</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(numero => {
                const informe = informes.find(i => i.numero_informe === numero);
                return (
                  <InformeCard 
                    key={numero}
                    numero={numero}
                    informe={informe}
                  />
                );
              })}
            </div>

            {/* Historial de Informes */}
            {informes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6">Historial de Informes</h3>
                <div className="space-y-4">
                  {informes.map(informe => (
                    <InformeHistorialItem key={informe.id_informe} informe={informe} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección: Buscar Ofertas */}
        {activeSection === 'buscar' && (
          <BuscarOfertas ofertas={ofertas} />
        )}

        {/* Sección: Mis Prácticas */}
        {activeSection === 'practicas' && (
          <MisPracticas practicas={practicas} />
        )}
      </main>
    </div>
  );
}

// ============ COMPONENTES ============

function NavLink({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${active ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MobileNavLink({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-gray-900">{label}</span>
    </button>
  );
}

function QuickStat({ icon, value, label }) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm text-white/80 font-semibold">{label}</p>
    </div>
  );
}

function KPICard({ titulo, valor, porcentaje, color, icono }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-600' }
  };
  const colors = colorClasses[color];

  return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icono}</span>
        <span className={`text-2xl font-black ${colors.text}`}>{valor}</span>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{titulo}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${colors.bar} h-2 rounded-full transition-all`} style={{ width: `${porcentaje}%` }}></div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{porcentaje}% completado</p>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs text-gray-600 font-semibold uppercase">{label}</p>
      </div>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function OfertaCard({ oferta }) {
  return (
    <div className="group p-4 border-2 border-gray-200 rounded-2xl hover:border-yellow-400 hover:shadow-lg transition cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition">{oferta.titulo_oferta}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span>🏢</span> {oferta.empresa_nombre}
          </p>
        </div>
        {oferta.ya_postulado && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Postulado</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">⏱️ {oferta.duracion_horas}h</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold">📍 {oferta.modalidad_trabajo}</span>
        {oferta.salario_referencial && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">💰 ${Number(oferta.salario_referencial).toLocaleString('es-CL')}</span>
        )}
      </div>
    </div>
  );
}

function PostulacionCard({ postulacion }) {
  const estados = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    aceptada: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
    en_revision: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '👁️' }
  };
  const config = estados[postulacion.estado_postulacion] || estados.pendiente;

  return (
    <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{postulacion.titulo_oferta}</p>
          <p className="text-xs text-gray-600 mt-1">{postulacion.empresa_nombre}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text} flex items-center gap-1 whitespace-nowrap`}>
          {config.icon}
        </span>
      </div>
    </div>
  );
}

function NotificacionItem({ notificacion, onMarcarLeida }) {
  return (
    <div 
      onClick={() => !notificacion.leida && onMarcarLeida(notificacion.id_notificacion)}
      className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-l-4 ${notificacion.leida ? 'border-transparent' : 'border-yellow-500 bg-yellow-50/30'}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{notificacion.tipo === 'informe' ? '📝' : notificacion.tipo === 'practica' ? '💼' : '📨'}</span>
        <div className="flex-1">
          <p className={`text-sm ${notificacion.leida ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
            {notificacion.mensaje}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notificacion.fecha_creacion).toLocaleDateString('es-CL', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        {!notificacion.leida && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
}

function InformeCard({ numero, informe }) {
  const estados = {
    aprobado: { 
      bg: 'bg-emerald-500', 
      text: 'text-white', 
      icon: '✓',
      label: 'Aprobado',
      borderColor: 'border-emerald-500'
    },
    pendiente_revision: { 
      bg: 'bg-amber-500', 
      text: 'text-white', 
      icon: '⏳',
      label: 'En Revisión',
      borderColor: 'border-amber-500'
    },
    rechazado: { 
      bg: 'bg-red-500', 
      text: 'text-white', 
      icon: '✗',
      label: 'Rechazado',
      borderColor: 'border-red-500'
    },
    sin_subir: { 
      bg: 'bg-gray-300', 
      text: 'text-gray-700', 
      icon: '📤',
      label: 'Sin Subir',
      borderColor: 'border-gray-300'
    }
  };

  const estado = informe ? (estados[informe.estado_informe] || estados.sin_subir) : estados.sin_subir;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${estado.borderColor}`}>
      <div className={`${estado.bg} ${estado.text} p-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black">Informe #{numero}</h3>
          <span className="text-2xl">{estado.icon}</span>
        </div>
        <p className="text-sm mt-1 opacity-90">{estado.label}</p>
      </div>
      
      <div className="p-4">
        {informe ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Fecha de subida</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(informe.fecha_subida).toLocaleDateString('es-CL')}
              </span>
            </div>
            
            {informe.fecha_revision && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Fecha de revisión</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(informe.fecha_revision).toLocaleDateString('es-CL')}
                </span>
              </div>
            )}
            
            {informe.calificacion && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Calificación</span>
                <span className="text-lg font-black text-blue-600">{informe.calificacion}</span>
              </div>
            )}
            
            {informe.comentarios && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Comentarios del profesor:</p>
                <p className="text-sm text-gray-900">{informe.comentarios}</p>
              </div>
            )}

            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
              Ver Detalles
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-5xl mb-3 block">📄</span>
            <p className="text-gray-600 text-sm mb-4">Aún no has subido este informe</p>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition text-sm">
              📤 Subir Informe #{numero}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InformeHistorialItem({ informe }) {
  const estados = {
    aprobado: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    pendiente_revision: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    rechazado: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' }
  };
  const config = estados[informe.estado_informe] || estados.pendiente_revision;

  return (
    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-900">Informe #{informe.numero_informe}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} flex items-center gap-1`}>
          {config.icon} {informe.estado_informe}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Subido:</p>
          <p className="font-semibold">{new Date(informe.fecha_subida).toLocaleDateString('es-CL')}</p>
        </div>
        {informe.calificacion && (
          <div>
            <p className="text-gray-600">Calificación:</p>
            <p className="font-black text-blue-600 text-lg">{informe.calificacion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BuscarOfertas({ ofertas }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [ordenamiento, setOrdenamiento] = useState('recientes');

  const ofertasFiltradas = ofertas
    .filter(oferta => {
      const matchBusqueda = oferta.titulo_oferta.toLowerCase().includes(busqueda.toLowerCase()) ||
                           oferta.empresa_nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchModalidad = filtroModalidad === 'todas' || 
                            oferta.modalidad_trabajo?.toLowerCase() === filtroModalidad.toLowerCase();
      return matchBusqueda && matchModalidad;
    })
    .sort((a, b) => {
      if (ordenamiento === 'recientes') return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
      if (ordenamiento === 'salario') return (b.salario_referencial || 0) - (a.salario_referencial || 0);
      if (ordenamiento === 'horas') return a.duracion_horas - b.duracion_horas;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">🔍 Buscar Ofertas</h2>
        <p className="text-gray-600">Encuentra la práctica perfecta para ti</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Buscar por empresa o título..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
            />
          </div>
          
          <select
            value={filtroModalidad}
            onChange={(e) => setFiltroModalidad(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
          >
            <option value="todas">📍 Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="híbrido">Híbrido</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-semibold">Ordenar por:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setOrdenamiento('recientes')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${ordenamiento === 'recientes' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Más recientes
            </button>
            <button
              onClick={() => setOrdenamiento('salario')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${ordenamiento === 'salario' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Mejor pagadas
            </button>
            <button
              onClick={() => setOrdenamiento('horas')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${ordenamiento === 'horas' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Menor duración
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div>
        <p className="text-gray-600 mb-4">{ofertasFiltradas.length} ofertas encontradas</p>
        <div className="grid md:grid-cols-2 gap-6">
          {ofertasFiltradas.map(oferta => (
            <div key={oferta.id_oferta} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{oferta.titulo_oferta}</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>🏢</span> {oferta.empresa_nombre}
                  </p>
                </div>
                {oferta.ya_postulado && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Postulado</span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{oferta.descripcion}</p>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">⏱️ {oferta.duracion_horas}h</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold">📍 {oferta.modalidad_trabajo}</span>
                {oferta.salario_referencial && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">💰 ${Number(oferta.salario_referencial).toLocaleString('es-CL')}</span>
                )}
              </div>

              <button 
                disabled={oferta.ya_postulado}
                className={`w-full px-4 py-3 rounded-xl font-bold transition ${
                  oferta.ya_postulado 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                }`}
              >
                {oferta.ya_postulado ? 'Ya postulaste' : '📨 Postular ahora'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MisPracticas({ practicas }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">💼 Mis Prácticas</h2>
        <p className="text-gray-600">Historial completo de tus prácticas profesionales</p>
      </div>

      {practicas.length > 0 ? (
        <div className="space-y-4">
          {practicas.map(practica => (
            <div key={practica.id_practica} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{practica.titulo_oferta}</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>🏢</span> {practica.empresa_nombre}
                  </p>
                </div>
                <EstadoPracticaBadge estado={practica.estado_practica} />
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">Inicio</p>
                  <p className="font-semibold">{new Date(practica.fecha_inicio_practica).toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Término</p>
                  <p className="font-semibold">{new Date(practica.fecha_termino_practica).toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Horas</p>
                  <p className="font-semibold">{practica.horas_completadas}/{practica.horas_requeridas}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Progreso</p>
                  <p className="font-black text-blue-600">{Math.round((practica.horas_completadas / practica.horas_requeridas) * 100)}%</p>
                </div>
              </div>

              {practica.profesor_nombre && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Profesor Guía</p>
                  <p className="font-semibold">{practica.profesor_nombre} {practica.profesor_apellido}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <span className="text-6xl mb-4 block">📋</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sin prácticas registradas</h3>
          <p className="text-gray-600">Aún no tienes prácticas en tu historial</p>
        </div>
      )}
    </div>
  );
}

function EstadoPracticaBadge({ estado }) {
  const estados = {
    en_curso: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Curso', icon: '▶️' },
    asignada: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Asignada', icon: '📌' },
    completada: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completada', icon: '✓' },
    cancelada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada', icon: '✗' }
  };
  const config = estados[estado] || estados.en_curso;

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text} flex items-center gap-2`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}