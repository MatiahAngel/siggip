// 📁 UBICACIÓN: frontend/src/paginas/profesor/DashboardProfesor.jsx
// 🎨 Dashboard Profesor con Bitácoras integradas
// ✅ ACTUALIZADO: Sección Bitácoras reemplaza Informes

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, FileText, Clock, CheckCircle, AlertCircle, TrendingUp,
  Calendar, Building2, Award, Eye, Bell, BookOpen, Activity,
  Briefcase, ChevronRight, Star, BarChart3, Filter, Search
} from 'lucide-react';
import {
  obtenerPerfilProfesor,
  obtenerEstadisticasProfesor,
  obtenerMisEstudiantes,
  obtenerBitacoraEstudiante
} from '../../servicios/api/profesoresService';
import ModalDetalleEstudiante from '../../components/profesor/ModalDetalleEstudiante';

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
  const [todasBitacoras, setTodasBitacoras] = useState([]);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);

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

  const cargarTodasLasBitacoras = async () => {
    try {
      setLoadingBitacoras(true);
      const bitacorasPromises = estudiantes.map(est => 
        obtenerBitacoraEstudiante(est.id_practica)
          .then(bitacora => 
            bitacora.map(actividad => ({
              ...actividad,
              estudiante: est,
              nombreEstudiante: `${est.estudiante_nombre} ${est.apellido_paterno || ''}`.trim(),
              empresaNombre: est.empresa_nombre
            }))
          )
          .catch(err => {
            console.error(`Error cargando bitácora de ${est.estudiante_nombre}:`, err);
            return [];
          })
      );

      const results = await Promise.all(bitacorasPromises);
      const todasLasActividades = results.flat();

      // Ordenar por fecha más reciente
      todasLasActividades.sort((a, b) => 
        new Date(b.fecha_actividad) - new Date(a.fecha_actividad)
      );

      setTodasBitacoras(todasLasActividades);
      console.log('✅ Bitácoras cargadas:', todasLasActividades.length);
    } catch (error) {
      console.error('❌ Error cargando bitácoras:', error);
    } finally {
      setLoadingBitacoras(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'bitacoras' && todasBitacoras.length === 0 && estudiantes.length > 0) {
      cargarTodasLasBitacoras();
    }
  }, [activeSection, estudiantes]);

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
                icon="📋" 
                label="Bitácoras" 
                active={activeSection === 'bitacoras'} 
                onClick={() => setActiveSection('bitacoras')} 
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
                        label="Ver Bitácoras"
                        description="Actividades registradas"
                        color="orange"
                        onClick={() => setActiveSection('bitacoras')}
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
                        Revisa las bitácoras y evaluaciones dentro de las primeras 48 horas para dar feedback oportuno a tus estudiantes.
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

        {activeSection === 'bitacoras' && (
          <SeccionBitacoras 
            bitacoras={todasBitacoras}
            loading={loadingBitacoras}
            estudiantes={estudiantes}
            onVerEstudiante={(est) => setEstudianteSeleccionado(est)}
          />
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

function SeccionBitacoras({ bitacoras, loading, estudiantes, onVerEstudiante }) {
  const [filtroEstudiante, setFiltroEstudiante] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const bitacorasFiltradas = bitacoras.filter(actividad => {
    // Filtrar por estudiante
    if (filtroEstudiante !== 'todos') {
      const estudianteId = parseInt(filtroEstudiante);
      if (actividad.estudiante?.id_practica !== estudianteId) return false;
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      if (actividad.estado_actividad !== filtroEstado) return false;
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const matchDescripcion = actividad.descripcion_actividad?.toLowerCase().includes(searchLower);
      const matchEstudiante = actividad.nombreEstudiante?.toLowerCase().includes(searchLower);
      const matchEmpresa = actividad.empresaNombre?.toLowerCase().includes(searchLower);
      
      if (!matchDescripcion && !matchEstudiante && !matchEmpresa) return false;
    }

    return true;
  });

  // Calcular estadísticas
  const totalHoras = bitacoras.reduce((sum, act) => {
    const horas = parseFloat(act.horas_dedicadas) || 0;
    return sum + horas;
  }, 0);
  const actividadesPendientes = bitacoras.filter(act => act.estado_actividad === 'pendiente').length;
  const actividadesValidadas = bitacoras.filter(act => act.estado_actividad === 'validada').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-gray-900">📋 Bitácoras de Estudiantes</h2>
        <p className="text-gray-600">Revisa todas las actividades registradas por tus estudiantes</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Actividades</p>
              <p className="text-2xl font-black text-gray-900">{bitacoras.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Validadas</p>
              <p className="text-2xl font-black text-gray-900">{actividadesValidadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-black text-gray-900">{actividadesPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Horas Totales</p>
              <p className="text-2xl font-black text-gray-900">{totalHoras.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar actividad, estudiante, empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por Estudiante */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filtroEstudiante}
              onChange={(e) => setFiltroEstudiante(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="todos">Todos los estudiantes</option>
              {estudiantes.map(est => (
                <option key={est.id_practica} value={est.id_practica}>
                  {est.estudiante_nombre} {est.apellido_paterno}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="validada">Validadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {(filtroEstudiante !== 'todos' || filtroEstado !== 'todos' || busqueda) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Mostrando {bitacorasFiltradas.length} de {bitacoras.length} actividades
            </span>
            <button
              onClick={() => {
                setFiltroEstudiante('todos');
                setFiltroEstado('todos');
                setBusqueda('');
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Actividades */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando bitácoras...</p>
          </div>
        ) : bitacorasFiltradas.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {bitacorasFiltradas.map((actividad, index) => (
              <ActividadBitacoraItem 
                key={actividad.id_actividad_bitacora || index} 
                actividad={actividad}
                onVerEstudiante={onVerEstudiante}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">No hay actividades</p>
            <p className="text-gray-600">
              {busqueda || filtroEstudiante !== 'todos' || filtroEstado !== 'todos'
                ? 'No se encontraron actividades con los filtros aplicados'
                : 'Aún no hay actividades registradas en las bitácoras'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActividadBitacoraItem({ actividad, onVerEstudiante }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => actividad.estudiante && onVerEstudiante(actividad.estudiante)}
              className="font-bold text-green-600 hover:text-green-700 hover:underline"
            >
              {actividad.nombreEstudiante}
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{actividad.empresaNombre}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              actividad.estado_actividad === 'validada' 
                ? 'bg-green-100 text-green-700' 
                : actividad.estado_actividad === 'rechazada'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}>
              {actividad.estado_actividad === 'validada' && '✅ Validada'}
              {actividad.estado_actividad === 'rechazada' && '❌ Rechazada'}
              {actividad.estado_actividad === 'pendiente' && '⏳ Pendiente'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(actividad.fecha_actividad).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <strong>{actividad.horas_dedicadas || 0} horas</strong>
            </span>
          </div>

          <p className="text-gray-900 leading-relaxed">
            {actividad.descripcion_actividad}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {expanded ? (
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-90 transition-transform" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Detalles expandibles */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {actividad.equipos_utilizados && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-900 mb-1">🔧 Equipos Utilizados:</p>
              <p className="text-sm text-blue-800">{actividad.equipos_utilizados}</p>
            </div>
          )}
          
          {actividad.herramientas_utilizadas && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-bold text-purple-900 mb-1">🛠️ Herramientas:</p>
              <p className="text-sm text-purple-800">{actividad.herramientas_utilizadas}</p>
            </div>
          )}
          
          {actividad.normas_seguridad_aplicadas && (
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs font-bold text-orange-900 mb-1">⚠️ Normas de Seguridad:</p>
              <p className="text-sm text-orange-800">{actividad.normas_seguridad_aplicadas}</p>
            </div>
          )}
          
          {actividad.observaciones && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-bold text-green-900 mb-1">💬 Comentarios Empresa:</p>
              <p className="text-sm text-green-800">{actividad.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}