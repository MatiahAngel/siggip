// 📁 UBICACIÓN: frontend/src/paginas/profesor/DashboardProfesor.jsx
// 🎨 Dashboard Profesor con datos reales y navegación

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, FileText, Clock, CheckCircle, AlertCircle, TrendingUp,
  Calendar, Building2, Award, Eye, Bell, BookOpen, Activity,
  Briefcase, ChevronRight, Star, BarChart3
} from 'lucide-react';
import {
  obtenerPerfilProfesor,
  obtenerEstadisticasProfesor,
  obtenerMisEstudiantes
} from '../../servicios/api/profesoresService';

export default function DashboardProfesor() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  
  // Estados de datos
  const [perfil, setPerfil] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total_estudiantes: 0,
    practicas_activas: 0,
    informes_pendientes: 0,
    evaluaciones_pendientes: 0,
    tasa_aprobacion: 0
  });
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar perfil
      const perfilData = await obtenerPerfilProfesor();
      setPerfil(perfilData);
      console.log('✅ Perfil cargado:', perfilData);

      // Cargar estadísticas
      const statsData = await obtenerEstadisticasProfesor();
      setEstadisticas(statsData);
      console.log('✅ Estadísticas cargadas:', statsData);

      // Cargar estudiantes
      const estudiantesData = await obtenerMisEstudiantes();
      setEstudiantes(estudiantesData);
      console.log('✅ Estudiantes cargados:', estudiantesData);

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      {/* Header Superior */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Título */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal Docente</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión de Prácticas</p>
              </div>
            </div>

            {/* Navegación */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink 
                icon="🏠" 
                label="Inicio" 
                active={activeSection === 'inicio'} 
                onClick={() => setActiveSection('inicio')} 
              />
              <NavLink 
                icon="👥" 
                label="Mis Estudiantes" 
                active={activeSection === 'estudiantes'} 
                onClick={() => setActiveSection('estudiantes')} 
              />
              <NavLink 
                icon="📝" 
                label="Informes" 
                active={activeSection === 'informes'} 
                onClick={() => setActiveSection('informes')} 
              />
              <NavLink 
                icon="⭐" 
                label="Evaluaciones" 
                active={activeSection === 'evaluaciones'} 
                onClick={() => setActiveSection('evaluaciones')} 
              />
            </div>

            {/* Acciones Header */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Menú de Usuario */}
              <div className="relative pl-4 border-l border-gray-200">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.nombre}</p>
                    <p className="text-xs text-gray-500">Profesor Guía</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.nombre?.charAt(0)}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{perfil?.nombre} {perfil?.apellido_paterno}</p>
                        <p className="text-xs text-gray-500 mt-1">{perfil?.email}</p>
                        {perfil?.nombre_especialidad && (
                          <p className="text-xs text-green-600 mt-1">📚 {perfil.nombre_especialidad}</p>
                        )}
                      </div>
                      
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                          <Users className="w-4 h-4" />
                          Mi Perfil
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          Mis Documentos
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bienvenida Hero */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                ¡Bienvenido, {user?.nombre}! 👋
              </h2>
              {perfil?.nombre_especialidad && (
                <p className="text-green-100 text-lg mb-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    📚 {perfil.nombre_especialidad}
                  </span>
                </p>
              )}
              <p className="text-green-100 text-lg">
                Tienes {estadisticas.evaluaciones_pendientes} evaluaciones pendientes de certificar
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6" />
                  <div>
                    <p className="text-sm text-green-100">Hoy</p>
                    <p className="font-bold text-lg">
                      {new Date().toLocaleDateString('es-CL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeSection === 'inicio' && (
          <>
            {/* Estadísticas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                icon={Users}
                label="Estudiantes"
                value={estadisticas.total_estudiantes}
                change={perfil?.nombre_especialidad || 'Total'}
                color="blue"
                trend="up"
              />
              <StatCard
                icon={Briefcase}
                label="Prácticas Activas"
                value={estadisticas.practicas_activas}
                change="En supervisión"
                color="green"
                trend="up"
              />
              <StatCard
                icon={Clock}
                label="Completadas"
                value={estadisticas.practicas_completadas}
                change="Este año"
                color="emerald"
                trend="up"
              />
              <StatCard
                icon={Award}
                label="Por Certificar"
                value={estadisticas.evaluaciones_pendientes}
                change="Pendientes"
                color="purple"
                trend="neutral"
              />
              <StatCard
                icon={TrendingUp}
                label="Tasa Aprobación"
                value={`${estadisticas.tasa_aprobacion}%`}
                change="Promedio"
                color="orange"
                trend="up"
              />
            </div>

            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Columna Principal - 2/3 */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Prácticas Activas */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Briefcase className="w-6 h-6" />
                          Prácticas en Curso
                        </h3>
                        <p className="text-green-100 text-sm mt-1">
                          Supervisa el progreso de tus estudiantes
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveSection('estudiantes')}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Ver Todos ({estudiantes.length})
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {estudiantes.slice(0, 3).map((estudiante) => (
                        <EstudianteCard 
                          key={estudiante.id_practica} 
                          estudiante={estudiante}
                          onClick={() => setEstudianteSeleccionado(estudiante)}
                        />
                      ))}
                      {estudiantes.length === 0 && (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-3">👥</div>
                          <p className="font-semibold text-gray-900">Sin estudiantes asignados</p>
                          <p className="text-sm text-gray-600">Aún no tienes prácticas activas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Lateral - 1/3 */}
              <div className="space-y-6">
                
                {/* Acciones Rápidas */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="font-bold text-gray-900">Acciones Rápidas</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <ActionButton
                        icon={Users}
                        label="Mis Estudiantes"
                        description={`${estudiantes.length} asignados`}
                        color="blue"
                        onClick={() => setActiveSection('estudiantes')}
                      />
                      <ActionButton
                        icon={FileText}
                        label="Revisar Informes"
                        description="Ver pendientes"
                        color="orange"
                        onClick={() => setActiveSection('informes')}
                      />
                      <ActionButton
                        icon={Award}
                        label="Certificar Evaluaciones"
                        description={`${estadisticas.evaluaciones_pendientes} pendientes`}
                        color="purple"
                        onClick={() => setActiveSection('evaluaciones')}
                      />
                      <ActionButton
                        icon={BarChart3}
                        label="Reportes"
                        description="Descargar métricas"
                        color="green"
                      />
                    </div>
                  </div>
                </div>

                {/* Tips del Día */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">💡 Consejo del Día</h4>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        Revisa las evaluaciones dentro de las primeras 48 horas para dar feedback oportuno a tus estudiantes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'estudiantes' && (
          <SeccionEstudiantes 
            estudiantes={estudiantes} 
            onVerDetalle={(est) => setEstudianteSeleccionado(est)}
          />
        )}

        {activeSection === 'informes' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sección de Informes</h3>
            <p className="text-gray-600">Próximamente...</p>
          </div>
        )}

        {activeSection === 'evaluaciones' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificación de Evaluaciones</h3>
            <p className="text-gray-600">Próximamente...</p>
          </div>
        )}
      </div>

      {/* Modal Detalle Estudiante */}
      {estudianteSeleccionado && (
        <ModalDetalleEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => setEstudianteSeleccionado(null)}
        />
      )}
    </div>
  );
}

// ==================== COMPONENTES ====================

function NavLink({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
        active ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, change, color, trend }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-br ${colors[color]} p-3 rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl">{trendIcons[trend]}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{change}</p>
    </div>
  );
}

function EstudianteCard({ estudiante, onClick }) {
  const nombreCompleto = `${estudiante.estudiante_nombre} ${estudiante.apellido_paterno || ''} ${estudiante.apellido_materno || ''}`.trim();
  
  return (
    <div 
      onClick={onClick}
      className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-lg">{nombreCompleto}</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {estudiante.codigo_estudiante}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {estudiante.empresa_nombre}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {estudiante.nombre_especialidad}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Progreso de horas</span>
          <span className="font-bold text-gray-900">
            {estudiante.horas_completadas} / {estudiante.horas_requeridas} hrs
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all shadow-inner"
              style={{ width: `${estudiante.progreso}%` }}
            ></div>
          </div>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
            {estudiante.progreso}%
          </span>
        </div>
      </div>

      {/* Botón Ver Detalles */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold">
        <Eye className="w-4 h-4" />
        Ver Detalles
      </button>
    </div>
  );
}

function ActionButton({ icon: Icon, label, description, color, onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100'
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors[color]} hover:shadow-md`}
    >
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs opacity-75">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

function SeccionEstudiantes({ estudiantes, onVerDetalle }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">👥 Mis Estudiantes</h2>
        <p className="text-gray-600">Supervisa el progreso de tus estudiantes asignados</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        {estudiantes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {estudiantes.map(est => (
              <EstudianteCard 
                key={est.id_practica} 
                estudiante={est}
                onClick={() => onVerDetalle(est)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">👥</div>
            <p className="font-semibold text-gray-900">Sin estudiantes asignados</p>
            <p className="text-sm text-gray-600">Aún no tienes prácticas activas para supervisar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalDetalleEstudiante({ estudiante, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-black">
                {estudiante.estudiante_nombre} {estudiante.apellido_paterno}
              </h3>
              <p className="text-green-100 text-sm">{estudiante.empresa_nombre}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Modal en Desarrollo</h4>
            <p className="text-gray-600 mb-4">
              Próximamente: Bitácora, Informes y Evaluación completa
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-900">Bitácora</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-orange-900">Informes</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-purple-900">Evaluación</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}