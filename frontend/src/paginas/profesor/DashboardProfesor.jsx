// 📁 frontend/src/paginas/profesor/DashboardProfesor.jsx
// 🎨 Dashboard Premium para Profesores - Diseño Moderno

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Building2,
  Award,
  Eye,
  Download,
  Bell,
  Search,
  Filter,
  MoreVertical,
  BookOpen,
  Target,
  Activity,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronRight,
  Star,
  BarChart3
} from 'lucide-react';

export default function DashboardProfesor() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [perfil, setPerfil] = useState(null); // Perfil completo del profesor
  const [estadisticas, setEstadisticas] = useState({
    total_estudiantes: 12,
    practicas_activas: 8,
    informes_pendientes: 5,
    evaluaciones_pendientes: 3,
    tasa_aprobacion: 94
  });
  const [practicasActivas, setPracticasActivas] = useState([]);
  const [informesPendientes, setInformesPendientes] = useState([]);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);

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
      
      // Cargar perfil del profesor
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/profesores/perfil', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
      
      // Datos de ejemplo - MUY MEJORADOS
      setPracticasActivas([
        {
          id: 1,
          estudiante: 'Juan Pérez González',
          codigo_estudiante: 'EST001',
          especialidad: 'Mecánica Industrial',
          empresa: 'Minera Los Pelambres',
          supervisor: 'Carlos Ramírez',
          fecha_inicio: '2025-03-01',
          horas_completadas: 180,
          horas_requeridas: 360,
          estado: 'en_curso',
          progreso: 50,
          calificacion_actual: 6.5,
          ultimo_informe: '2025-10-15'
        },
        {
          id: 2,
          estudiante: 'María González López',
          codigo_estudiante: 'EST002',
          especialidad: 'Agropecuaria',
          empresa: 'Agrícola Santa Rosa',
          supervisor: 'Ana Torres',
          fecha_inicio: '2025-03-15',
          horas_completadas: 145,
          horas_requeridas: 360,
          estado: 'en_curso',
          progreso: 40,
          calificacion_actual: 6.8,
          ultimo_informe: '2025-10-18'
        },
        {
          id: 3,
          estudiante: 'Pedro Sánchez Rojas',
          codigo_estudiante: 'EST003',
          especialidad: 'Mecánica Industrial',
          empresa: 'Maestranza Central',
          supervisor: 'Luis Morales',
          fecha_inicio: '2025-02-20',
          horas_completadas: 280,
          horas_requeridas: 360,
          estado: 'en_curso',
          progreso: 78,
          calificacion_actual: 7.0,
          ultimo_informe: '2025-10-10'
        }
      ]);

      setInformesPendientes([
        {
          id: 1,
          estudiante: 'Juan Pérez González',
          codigo_estudiante: 'EST001',
          titulo: 'Informe Mensual #3',
          fecha_envio: '2025-10-18',
          dias_pendientes: 3,
          prioridad: 'alta',
          empresa: 'Minera Los Pelambres'
        },
        {
          id: 2,
          estudiante: 'María González López',
          codigo_estudiante: 'EST002',
          titulo: 'Informe Mensual #2',
          fecha_envio: '2025-10-15',
          dias_pendientes: 6,
          prioridad: 'media',
          empresa: 'Agrícola Santa Rosa'
        },
        {
          id: 3,
          estudiante: 'Ana Martínez Silva',
          codigo_estudiante: 'EST004',
          titulo: 'Informe Final',
          fecha_envio: '2025-10-20',
          dias_pendientes: 1,
          prioridad: 'urgente',
          empresa: 'Viña Tabalí'
        }
      ]);

      setActividadesRecientes([
        {
          id: 1,
          tipo: 'informe_aprobado',
          descripcion: 'Aprobaste el Informe #2 de Juan Pérez',
          fecha: '2025-10-20 14:30',
          icono: CheckCircle,
          color: 'text-green-600'
        },
        {
          id: 2,
          tipo: 'nueva_practica',
          descripcion: 'Nueva práctica asignada: Pedro Sánchez',
          fecha: '2025-10-19 10:15',
          icono: Briefcase,
          color: 'text-blue-600'
        },
        {
          id: 3,
          tipo: 'evaluacion',
          descripcion: 'Evaluación pendiente para María González',
          fecha: '2025-10-18 16:45',
          icono: Award,
          color: 'text-purple-600'
        }
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
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

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Overlay para cerrar el menú */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.nombre} {user?.apellido_paterno}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
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
                Tienes {estadisticas.informes_pendientes} informes pendientes de revisión
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
        
        {/* Estadísticas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Estudiantes"
            value={estadisticas.total_estudiantes}
            change="+2 este mes"
            color="blue"
            trend="up"
          />
          <StatCard
            icon={Briefcase}
            label="Prácticas Activas"
            value={estadisticas.practicas_activas}
            change="66% del total"
            color="green"
            trend="up"
          />
          <StatCard
            icon={Clock}
            label="Pendientes"
            value={estadisticas.informes_pendientes}
            change="Revisar en 72h"
            color="orange"
            trend="neutral"
          />
          <StatCard
            icon={Award}
            label="Evaluaciones"
            value={estadisticas.evaluaciones_pendientes}
            change="2 próximas"
            color="purple"
            trend="neutral"
          />
          <StatCard
            icon={TrendingUp}
            label="Tasa Aprobación"
            value={`${estadisticas.tasa_aprobacion}%`}
            change="+3% vs anterior"
            color="emerald"
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
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors text-sm">
                    Ver Todas
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {practicasActivas.map((practica) => (
                    <PracticaCard key={practica.id} practica={practica} />
                  ))}
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Actividad Reciente
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {actividadesRecientes.map((actividad) => (
                    <ActividadItem key={actividad.id} actividad={actividad} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral - 1/3 */}
          <div className="space-y-6">
            
            {/* Informes Pendientes */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg overflow-hidden text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Informes Urgentes
                  </h3>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    {informesPendientes.length}
                  </span>
                </div>
                <p className="text-orange-100 text-sm mb-4">
                  Revisión máxima en 72 horas
                </p>
                <div className="space-y-3">
                  {informesPendientes.map((informe) => (
                    <InformePendienteCard key={informe.id} informe={informe} />
                  ))}
                </div>
              </div>
            </div>

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
                    description="Ver lista completa"
                    color="blue"
                  />
                  <ActionButton
                    icon={FileText}
                    label="Revisar Informes"
                    description="5 pendientes"
                    color="orange"
                  />
                  <ActionButton
                    icon={Award}
                    label="Evaluar Prácticas"
                    description="3 evaluaciones"
                    color="purple"
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
                    Revisa los informes dentro de las primeras 48 horas para dar feedback oportuno a tus estudiantes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTES ====================

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

function PracticaCard({ practica }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-lg">{practica.estudiante}</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {practica.codigo_estudiante}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {practica.empresa}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {practica.especialidad}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-green-600">
            {practica.calificacion_actual}
          </div>
          <p className="text-xs text-gray-500">Nota actual</p>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Progreso de horas</span>
          <span className="font-bold text-gray-900">
            {practica.horas_completadas} / {practica.horas_requeridas} hrs
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all shadow-inner"
              style={{ width: `${practica.progreso}%` }}
            ></div>
          </div>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
            {practica.progreso}%
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-semibold">
          <FileText className="w-4 h-4" />
          Informes
        </button>
        <button className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-semibold">
          <Award className="w-4 h-4" />
          Evaluar
        </button>
      </div>
    </div>
  );
}

function InformePendienteCard({ informe }) {
  const prioridades = {
    urgente: { bg: 'bg-red-500', icon: '🚨' },
    alta: { bg: 'bg-orange-500', icon: '⚠️' },
    media: { bg: 'bg-yellow-500', icon: '⏰' }
  };
  
  const config = prioridades[informe.prioridad];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{informe.estudiante}</p>
          <p className="text-orange-100 text-xs mt-1">{informe.titulo}</p>
          <p className="text-orange-200 text-xs mt-2">
            Hace {informe.dias_pendientes} días
          </p>
        </div>
        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ActividadItem({ actividad }) {
  const Icon = actividad.icono;
  
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`p-2 bg-white rounded-lg shadow-sm ${actividad.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{actividad.descripcion}</p>
        <p className="text-xs text-gray-500 mt-1">{actividad.fecha}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, description, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100'
  };

  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors[color]} hover:shadow-md`}>
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