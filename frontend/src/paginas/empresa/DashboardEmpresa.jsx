// 📁 UBICACIÓN: frontend/src/paginas/empresa/DashboardEmpresa.jsx
// 🎯 PROPÓSITO: Dashboard completo para empresas - Tema naranjo corporativo

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardEmpresa() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ofertasActivas: 0,
    postulacionesPendientes: 0,
    practicantesActivos: 0,
    evaluacionesPendientes: 0,
  });
  const [ofertas, setOfertas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [practicantes, setPracticantes] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Reemplazar con llamadas reales a API cuando estén disponibles
      // Datos de ejemplo
      setStats({
        ofertasActivas: 5,
        postulacionesPendientes: 12,
        practicantesActivos: 3,
        evaluacionesPendientes: 2,
      });

      setOfertas([
        {
          id_oferta: 1,
          titulo_oferta: 'Práctica en Desarrollo Web',
          postulaciones_count: 8,
          estado_oferta: 'activa',
          fecha_publicacion: new Date().toISOString(),
          duracion_horas: 360,
        },
        {
          id_oferta: 2,
          titulo_oferta: 'Práctica en Diseño Gráfico',
          postulaciones_count: 4,
          estado_oferta: 'activa',
          fecha_publicacion: new Date().toISOString(),
          duracion_horas: 320,
        },
      ]);

      setPostulaciones([
        {
          id_postulacion: 1,
          estudiante_nombre: 'Juan Pérez González',
          titulo_oferta: 'Práctica en Desarrollo Web',
          estado_postulacion: 'pendiente',
          fecha_postulacion: new Date().toISOString(),
          especialidad: 'Programación',
        },
        {
          id_postulacion: 2,
          estudiante_nombre: 'María Silva Torres',
          titulo_oferta: 'Práctica en Diseño Gráfico',
          estado_postulacion: 'pendiente',
          fecha_postulacion: new Date().toISOString(),
          especialidad: 'Diseño',
        },
      ]);

      setPracticantes([
        {
          id_practica: 1,
          estudiante_nombre: 'Carlos Ramírez',
          titulo_oferta: 'Práctica en Desarrollo Web',
          progreso: 65,
          horas_completadas: 234,
          horas_requeridas: 360,
          fecha_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={cargarDatos} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">SIGGIP</h1>
                <p className="text-xs text-gray-600">Portal Empresas</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink icon="🏠" label="Inicio" active={activeSection === 'inicio'} onClick={() => setActiveSection('inicio')} />
              <NavLink icon="💼" label="Mis Ofertas" active={activeSection === 'ofertas'} onClick={() => setActiveSection('ofertas')} />
              <NavLink icon="📨" label="Postulaciones" active={activeSection === 'postulaciones'} onClick={() => setActiveSection('postulaciones')} />
              <NavLink icon="👥" label="Practicantes" active={activeSection === 'practicantes'} onClick={() => setActiveSection('practicantes')} />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{user?.nombre?.charAt(0) || 'E'}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-900">{user?.nombre || 'Empresa'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-bold text-gray-900">{user?.nombre || 'Empresa'}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                      <span>🏢</span> Perfil de Empresa
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

              {/* Mobile menu button */}
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <MobileNavLink icon="🏠" label="Inicio" onClick={() => { setActiveSection('inicio'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="💼" label="Mis Ofertas" onClick={() => { setActiveSection('ofertas'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="📨" label="Postulaciones" onClick={() => { setActiveSection('postulaciones'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="👥" label="Practicantes" onClick={() => { setActiveSection('practicantes'); setShowMobileMenu(false); }} />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sección Inicio */}
        {activeSection === 'inicio' && (
          <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTYtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-full">
                    <p className="text-white font-bold text-sm">🏢 Panel de Control</p>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Bienvenido, {user?.nombre || 'Empresa'}
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Gestiona tus ofertas, revisa postulaciones y supervisa a tus practicantes
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickStat icon="💼" value={stats.ofertasActivas} label="Ofertas Activas" />
                  <QuickStat icon="📨" value={stats.postulacionesPendientes} label="Postulaciones" />
                  <QuickStat icon="👥" value={stats.practicantesActivos} label="Practicantes" />
                  <QuickStat icon="📝" value={stats.evaluacionesPendientes} label="Evaluaciones" />
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <KPICard
                titulo="Tasa de Respuesta"
                valor="85%"
                porcentaje={85}
                color="orange"
                icono="📊"
                descripcion="Postulaciones respondidas"
              />
              <KPICard
                titulo="Satisfacción Promedio"
                valor="4.7/5"
                porcentaje={94}
                color="amber"
                icono="⭐"
                descripcion="Calificación de practicantes"
              />
              <KPICard
                titulo="Retención"
                valor="92%"
                porcentaje={92}
                color="yellow"
                icono="🎯"
                descripcion="Prácticas completadas"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Ofertas Activas */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Mis Ofertas Activas</h3>
                    <p className="text-gray-600">{ofertas.length} publicadas</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('ofertas')}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition text-sm"
                  >
                    Ver Todas →
                  </button>
                </div>

                <div className="space-y-4">
                  {ofertas.length > 0 ? (
                    ofertas.map(oferta => (
                      <OfertaCard key={oferta.id_oferta} oferta={oferta} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">💼</div>
                      <p className="font-semibold text-gray-900 mb-2">Sin ofertas activas</p>
                      <p className="text-sm text-gray-600 mb-4">Publica tu primera oferta de práctica</p>
                      <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition">
                        ➕ Nueva Oferta
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Postulaciones Recientes */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900">Postulaciones Recientes</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {stats.postulacionesPendientes} nuevas
                  </span>
                </div>
                <div className="space-y-3">
                  {postulaciones.length > 0 ? (
                    postulaciones.slice(0, 5).map(post => (
                      <PostulacionCard key={post.id_postulacion} postulacion={post} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">📭</div>
                      <p className="font-semibold text-gray-900">Sin postulaciones</p>
                      <p className="text-sm text-gray-600">Aún no hay estudiantes postulando</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Practicantes Activos */}
            {practicantes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">👥 Practicantes Activos</h3>
                  <button 
                    onClick={() => setActiveSection('practicantes')}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition text-sm"
                  >
                    Ver Todos →
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {practicantes.map(practicante => (
                    <PracticanteCard key={practicante.id_practica} practicante={practicante} />
                  ))}
                </div>
              </div>
            )}

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionButton icon="➕" label="Nueva Oferta" onClick={() => setActiveSection('ofertas')} gradient="from-orange-500 to-orange-600" />
                <ActionButton icon="📨" label="Ver Postulaciones" onClick={() => setActiveSection('postulaciones')} gradient="from-amber-500 to-amber-600" />
                <ActionButton icon="👥" label="Mis Practicantes" onClick={() => setActiveSection('practicantes')} gradient="from-yellow-500 to-yellow-600" />
                <ActionButton icon="📊" label="Reportes" onClick={() => {}} gradient="from-orange-600 to-red-600" />
              </div>
            </div>
          </>
        )}

        {/* Sección Ofertas */}
        {activeSection === 'ofertas' && (
          <SeccionOfertas ofertas={ofertas} />
        )}

        {/* Sección Postulaciones */}
        {activeSection === 'postulaciones' && (
          <SeccionPostulaciones postulaciones={postulaciones} />
        )}

        {/* Sección Practicantes */}
        {activeSection === 'practicantes' && (
          <SeccionPracticantes practicantes={practicantes} />
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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${active ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
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

function KPICard({ titulo, valor, porcentaje, color, icono, descripcion }) {
  const colorClasses = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-600' }
  };
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icono}</span>
        <span className={`text-2xl font-black ${colors.text}`}>{valor}</span>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{titulo}</p>
      <p className="text-xs text-gray-500 mb-3">{descripcion}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${colors.bar} h-2 rounded-full transition-all`} style={{ width: `${porcentaje}%` }}></div>
      </div>
    </div>
  );
}

function OfertaCard({ oferta }) {
  return (
    <div className="group p-4 border-2 border-gray-200 rounded-2xl hover:border-orange-400 hover:shadow-lg transition cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition">{oferta.titulo_oferta}</h4>
          <p className="text-sm text-gray-600">Publicada {new Date(oferta.fecha_publicacion).toLocaleDateString('es-CL')}</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Activa</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold">📨 {oferta.postulaciones_count} postulaciones</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">⏱️ {oferta.duracion_horas}h</span>
      </div>
    </div>
  );
}

function PostulacionCard({ postulacion }) {
  const estados = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    aceptada: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
  };
  const config = estados[postulacion.estado_postulacion] || estados.pendiente;

  return (
    <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{postulacion.estudiante_nombre}</p>
          <p className="text-xs text-gray-600">{postulacion.especialidad}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text} flex items-center gap-1 whitespace-nowrap`}>
          {config.icon}
        </span>
      </div>
      <p className="text-xs text-gray-500">{postulacion.titulo_oferta}</p>
    </div>
  );
}

function PracticanteCard({ practicante }) {
  return (
    <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">{practicante.estudiante_nombre.charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{practicante.estudiante_nombre}</p>
            <p className="text-sm text-gray-600">{practicante.titulo_oferta}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso</span>
            <span className="font-bold text-orange-600">{practicante.progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 h-2 rounded-full transition-all" style={{ width: `${practicante.progreso}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 bg-white rounded-lg">
          <p className="text-gray-600">Horas</p>
          <p className="font-bold text-gray-900">{practicante.horas_completadas}/{practicante.horas_requeridas}</p>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <p className="text-gray-600">Inicio</p>
          <p className="font-bold text-gray-900">{new Date(practicante.fecha_inicio).toLocaleDateString('es-CL')}</p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, gradient }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 bg-gradient-to-br ${gradient} rounded-xl text-center transition-all group shadow-md hover:shadow-xl transform hover:-translate-y-1`}
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-sm font-semibold text-white">{label}</p>
    </button>
  );
}

function SeccionOfertas({ ofertas }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">💼 Mis Ofertas</h2>
          <p className="text-gray-600">Gestiona tus ofertas de práctica profesional</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 transition shadow-lg">
          ➕ Nueva Oferta
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        {ofertas.length > 0 ? (
          <div className="space-y-4">
            {ofertas.map(oferta => (
              <OfertaCard key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">💼</div>
            <p className="font-semibold text-gray-900 mb-2">Sin ofertas publicadas</p>
            <p className="text-sm text-gray-600">Crea tu primera oferta de práctica profesional</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SeccionPostulaciones({ postulaciones }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">📨 Postulaciones</h2>
        <p className="text-gray-600">Revisa y gestiona las postulaciones recibidas</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        {postulaciones.length > 0 ? (
          <div className="space-y-3">
            {postulaciones.map(post => (
              <div key={post.id_postulacion} className="p-5 border-2 border-gray-200 rounded-2xl hover:border-orange-400 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{post.estudiante_nombre.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{post.estudiante_nombre}</p>
                      <p className="text-sm text-gray-600">{post.especialidad}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">⏳ Pendiente</span>
                </div>
                <p className="text-sm text-gray-700 mb-4">Postulación a: <span className="font-semibold">{post.titulo_oferta}</span></p>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
                    ✓ Aceptar
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition">
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">📭</div>
            <p className="font-semibold text-gray-900">Sin postulaciones</p>
            <p className="text-sm text-gray-600">Aún no hay estudiantes postulando a tus ofertas</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SeccionPracticantes({ practicantes }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">👥 Mis Practicantes</h2>
        <p className="text-gray-600">Supervisa el progreso de tus practicantes activos</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        {practicantes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {practicantes.map(practicante => (
              <PracticanteCard key={practicante.id_practica} practicante={practicante} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">👥</div>
            <p className="font-semibold text-gray-900">Sin practicantes activos</p>
            <p className="text-sm text-gray-600">Acepta postulaciones para iniciar prácticas</p>
          </div>
        )}
      </div>
    </div>
  );
}
