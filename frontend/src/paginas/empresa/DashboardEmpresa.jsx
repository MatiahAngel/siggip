// 📁 UBICACIÓN: frontend/src/paginas/empresa/DashboardEmpresa.jsx
// 🎯 DASHBOARD COMPLETO CON NOTIFICACIONES BONITAS
// ✅ Sistema de notificaciones sin CSS externo
// ✅ Verificación de evaluaciones y badges de estado
// ✅ Botón "Evaluar" condicional según estado

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormularioOferta from '../../components/ofertas/FormularioOferta.jsx';
import ModalEvaluacionFinal from '../../components/evaluacion/ModalEvaluacionFinal.jsx';
import { getOfertasByEmpresa } from '../../servicios/api/ofertasService';
import { getMiEmpresa } from '../../servicios/api/empresasService';
import { 
  getPostulacionesEmpresa, 
  aceptarPostulacionEmpresa, 
  rechazarPostulacionEmpresa,
  getPracticantesEmpresa,
  getPlanPractica,
  getBitacoraPracticante,
  getEvaluacionesPracticante,
  validarActividadBitacora,
  verificarEvaluacionFinal
} from '../../servicios/api/empresasService';

// ============ COMPONENTE: Notificación Toast ============
function Notificacion({ tipo, mensaje, onClose }) {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => {
      setSaliendo(true);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const configs = {
    exito: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      icono: '✅',
      titulo: '¡Éxito!'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icono: '❌',
      titulo: 'Error'
    },
    advertencia: {
      bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      icono: '⚠️',
      titulo: 'Atención'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icono: 'ℹ️',
      titulo: 'Información'
    }
  };

  const config = configs[tipo] || configs.info;

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] max-w-md min-w-[320px]"
      style={{
        transform: visible && !saliendo ? 'translateX(0)' : 'translateX(400px)',
        opacity: visible && !saliendo ? 1 : 0,
        transition: 'all 0.3s ease-out'
      }}
    >
      <div className={`${config.bg} text-white rounded-2xl shadow-2xl p-5`}>
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{config.icono}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-lg mb-1">{config.titulo}</h4>
            <p className="text-white/90 text-sm leading-relaxed break-words">{mensaje}</p>
          </div>
          <button 
            onClick={() => {
              setSaliendo(true);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white transition flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTE: Modal de Confirmación ============
function ModalConfirmacion({ titulo, mensaje, onConfirmar, onCancelar, tipo = 'info' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  const configs = {
    info: {
      bg: 'from-blue-600 to-blue-500',
      icono: 'ℹ️',
      botonTexto: 'Confirmar',
      botonClase: 'bg-blue-600 hover:bg-blue-700'
    },
    advertencia: {
      bg: 'from-amber-600 to-amber-500',
      icono: '⚠️',
      botonTexto: 'Continuar',
      botonClase: 'bg-amber-600 hover:bg-amber-700'
    },
    peligro: {
      bg: 'from-red-600 to-red-500',
      icono: '🚨',
      botonTexto: 'Confirmar',
      botonClase: 'bg-red-600 hover:bg-red-700'
    },
    exito: {
      bg: 'from-emerald-600 to-emerald-500',
      icono: '✅',
      botonTexto: 'Aceptar',
      botonClase: 'bg-emerald-600 hover:bg-emerald-700'
    }
  };

  const config = configs[tipo] || configs.info;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-out'
      }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.9)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s ease-out'
        }}
      >
        <div className={`px-6 py-5 bg-gradient-to-r ${config.bg}`}>
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{config.icono}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black">{titulo}</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{mensaje}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancelar}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`px-6 py-3 text-white rounded-xl font-semibold transition ${config.botonClase}`}
          >
            {config.botonTexto}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============
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
  const [respondiendoId, setRespondiendoId] = useState(null);
  const [detallePostulacion, setDetallePostulacion] = useState(null);
  const [practicantes, setPracticantes] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [showCrearOferta, setShowCrearOferta] = useState(false);
  
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);
  const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false);
  const [practicanteEvaluar, setPracticanteEvaluar] = useState(null);

  // Estados para notificaciones bonitas
  const [notificacion, setNotificacion] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(null);

  // Estado para almacenar evaluaciones de practicantes
  const [evaluacionesPracticantes, setEvaluacionesPracticantes] = useState({});

  // Funciones auxiliares para notificaciones
  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
  };

  const mostrarConfirmacion = (tipo, titulo, mensaje, onConfirmar) => {
    setModalConfirmacion({
      tipo,
      titulo,
      mensaje,
      onConfirmar,
      onCancelar: () => setModalConfirmacion(null)
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const miEmp = await getMiEmpresa().catch(() => null);
      const idEmp = miEmp?.id_empresa ?? miEmp?.id ?? null;

      let ofertasApi = [];
      if (idEmp) {
        ofertasApi = await getOfertasByEmpresa(idEmp).catch(() => []);
      } else {
        ofertasApi = [];
      }
      const listaOfertas = Array.isArray(ofertasApi) ? ofertasApi : [];
      setOfertas(listaOfertas);

      const posts = await getPostulacionesEmpresa().catch(() => []);
      const listaPost = Array.isArray(posts) ? posts : [];
      setPostulaciones(listaPost);

      const practs = await getPracticantesEmpresa().catch(() => []);
      const listaPracts = Array.isArray(practs) ? practs : [];
      const practicantesConProgreso = listaPracts.map(p => ({
        ...p,
        progreso: p.horas_requeridas > 0 ? Math.round((Number(p.horas_completadas || 0) / Number(p.horas_requeridas)) * 100) : 0
      }));
      setPracticantes(practicantesConProgreso);

      // Verificar evaluaciones para cada practicante
      const evaluacionesMap = {};
      let evaluacionesPendientes = 0;
      
      for (const prac of practicantesConProgreso) {
        try {
          const resultado = await verificarEvaluacionFinal(prac.id_practica);
          evaluacionesMap[prac.id_practica] = resultado;

          const estado = resultado?.evaluacion?.estado_evaluacion;

          
          if (prac.progreso >= 80 && (!resultado.existe || estado !== 'completada')) {
            evaluacionesPendientes++;
          }
        } catch (e) {
          evaluacionesMap[prac.id_practica] = { existe: false };
        }
      }
      
      setEvaluacionesPracticantes(evaluacionesMap);

      const activas = (listaOfertas || []).filter(o => (o.estado_oferta || o.estado) === 'activa').length;
      const totalPostPend = (listaPost || []).filter(p => ['pendiente', 'en_revision'].includes(p.estado_postulacion)).length;

      setStats({
        ofertasActivas: activas,
        postulacionesPendientes: totalPostPend,
        practicantesActivos: practicantesConProgreso.length,
        evaluacionesPendientes,
      });

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

  const handleAceptar = async (post) => {
    mostrarConfirmacion(
      'exito',
      'Aceptar Postulación',
      `¿Confirmas que deseas aceptar la postulación de ${post.estudiante_nombre} para "${post.titulo_oferta}"?\n\nEsta acción iniciará el proceso de práctica profesional.`,
      async () => {
        setModalConfirmacion(null);
        setRespondiendoId(post.id_postulacion);
        try {
          await aceptarPostulacionEmpresa(post.id_postulacion);
          await cargarDatos();
          mostrarNotificacion('exito', `Postulación de ${post.estudiante_nombre} aceptada exitosamente`);
        } catch (e) {
          mostrarNotificacion('error', e.response?.data?.error || 'Error al aceptar la postulación');
        } finally {
          setRespondiendoId(null);
        }
      }
    );
  };

  const handleRechazar = async (post) => {
    const comentarios = prompt(`Motivo de rechazo para ${post.estudiante_nombre}:`, '');
    if (comentarios === null) return;
    
    mostrarConfirmacion(
      'peligro',
      'Rechazar Postulación',
      `¿Confirmas que deseas rechazar la postulación de ${post.estudiante_nombre}?\n\nMotivo: ${comentarios || 'Sin motivo especificado'}`,
      async () => {
        setModalConfirmacion(null);
        setRespondiendoId(post.id_postulacion);
        try {
          await rechazarPostulacionEmpresa(post.id_postulacion, comentarios);
          await cargarDatos();
          mostrarNotificacion('info', `Postulación de ${post.estudiante_nombre} rechazada`);
        } catch (e) {
          mostrarNotificacion('error', e.response?.data?.error || 'Error al rechazar la postulación');
        } finally {
          setRespondiendoId(null);
        }
      }
    );
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
      {/* Sistema de notificaciones */}
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}

      {modalConfirmacion && (
        <ModalConfirmacion
          tipo={modalConfirmacion.tipo}
          titulo={modalConfirmacion.titulo}
          mensaje={modalConfirmacion.mensaje}
          onConfirmar={modalConfirmacion.onConfirmar}
          onCancelar={modalConfirmacion.onCancelar}
        />
      )}

      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">SIGGIP</h1>
                <p className="text-xs text-gray-600">Portal Empresas</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <NavLink icon="🏠" label="Inicio" active={activeSection === 'inicio'} onClick={() => setActiveSection('inicio')} />
              <NavLink icon="💼" label="Mis Ofertas" active={activeSection === 'ofertas'} onClick={() => setActiveSection('ofertas')} />
              <NavLink icon="📨" label="Postulaciones" active={activeSection === 'postulaciones'} onClick={() => setActiveSection('postulaciones')} />
              <NavLink icon="👥" label="Practicantes" active={activeSection === 'practicantes'} onClick={() => setActiveSection('practicantes')} />
            </div>

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

              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

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
        {activeSection === 'inicio' && (
          <>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickStat icon="💼" value={stats.ofertasActivas} label="Ofertas Activas" />
                  <QuickStat icon="📨" value={stats.postulacionesPendientes} label="Postulaciones" />
                  <QuickStat icon="👥" value={stats.practicantesActivos} label="Practicantes" />
                  <QuickStat icon="📝" value={stats.evaluacionesPendientes} label="Evaluaciones" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <KPICard titulo="Tasa de Respuesta" valor="85%" porcentaje={85} color="orange" icono="📊" descripcion="Postulaciones respondidas" />
              <KPICard titulo="Satisfacción Promedio" valor="4.7/5" porcentaje={94} color="amber" icono="⭐" descripcion="Calificación de practicantes" />
              <KPICard titulo="Retención" valor="92%" porcentaje={92} color="yellow" icono="🎯" descripcion="Prácticas completadas" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Mis Ofertas Activas</h3>
                    <p className="text-gray-600">{ofertas.length} publicadas</p>
                  </div>
                  <button onClick={() => setActiveSection('ofertas')} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition text-sm">
                    Ver Todas →
                  </button>
                </div>

                <div className="space-y-4">
                  {ofertas.length > 0 ? (
                    ofertas.map(oferta => <OfertaCard key={oferta.id_oferta} oferta={oferta} />)
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">💼</div>
                      <p className="font-semibold text-gray-900 mb-2">Sin ofertas activas</p>
                      <p className="text-sm text-gray-600 mb-4">Publica tu primera oferta de práctica</p>
                      <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition" onClick={() => setShowCrearOferta(true)}>
                        ➕ Nueva Oferta
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900">Postulaciones Recientes</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {stats.postulacionesPendientes} nuevas
                  </span>
                </div>
                <div className="space-y-3">
                  {postulaciones.length > 0 ? (
                    postulaciones.slice(0, 5).map(post => <PostulacionCard key={post.id_postulacion} postulacion={post} />)
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

            {practicantes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">👥 Practicantes Activos</h3>
                  <button onClick={() => setActiveSection('practicantes')} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition text-sm">
                    Ver Todos →
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {practicantes.map(practicante => (
                    <PracticanteCard 
                      key={practicante.id_practica} 
                      practicante={practicante}
                      evaluacion={evaluacionesPracticantes[practicante.id_practica]}
                      onClick={() => setPracticanteSeleccionado(practicante)}
                      onEvaluar={(p) => {
                        setPracticanteEvaluar(p);
                        setMostrarEvaluacion(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionButton icon="➕" label="Nueva Oferta" onClick={() => setShowCrearOferta(true)} gradient="from-orange-500 to-orange-600" />
                <ActionButton icon="📨" label="Ver Postulaciones" onClick={() => setActiveSection('postulaciones')} gradient="from-amber-500 to-amber-600" />
                <ActionButton icon="👥" label="Mis Practicantes" onClick={() => setActiveSection('practicantes')} gradient="from-yellow-500 to-yellow-600" />
                <ActionButton icon="📊" label="Reportes" onClick={() => {}} gradient="from-orange-600 to-red-600" />
              </div>
            </div>
          </>
        )}

        {activeSection === 'ofertas' && (
          <SeccionOfertas ofertas={ofertas} onNuevaOferta={() => setShowCrearOferta(true)} />
        )}

        {activeSection === 'postulaciones' && (
          <SeccionPostulaciones 
            postulaciones={postulaciones} 
            onAceptar={handleAceptar}
            onRechazar={handleRechazar}
            respondiendoId={respondiendoId}
            onVerDetalle={(p) => setDetallePostulacion(p)}
          />
        )}

        {activeSection === 'practicantes' && (
          <SeccionPracticantes 
            practicantes={practicantes}
            evaluacionesPracticantes={evaluacionesPracticantes}
            onVerDetalle={(p) => setPracticanteSeleccionado(p)}
            onEvaluar={(p) => {
              setPracticanteEvaluar(p);
              setMostrarEvaluacion(true);
            }}
          />
        )}
      </main>

      {detallePostulacion && (
        <ModalDetallePostulacion 
          postulacion={detallePostulacion}
          onClose={() => setDetallePostulacion(null)}
          onAceptar={() => handleAceptar(detallePostulacion)}
          onRechazar={() => handleRechazar(detallePostulacion)}
          respondiendoId={respondiendoId}
        />
      )}

      {showCrearOferta && (
        <FormularioOferta
          onClose={() => setShowCrearOferta(false)}
          onSuccess={() => {
            cargarDatos();
            setShowCrearOferta(false);
            setActiveSection('ofertas');
            mostrarNotificacion('exito', 'Oferta publicada exitosamente');
          }}
        />
      )}

      {practicanteSeleccionado && (
        <ModalDetallePracticanteNuevo
          practicante={practicanteSeleccionado}
          evaluacion={evaluacionesPracticantes[practicanteSeleccionado.id_practica]}
          onClose={() => setPracticanteSeleccionado(null)}
          onRefresh={cargarDatos}
          onEvaluar={(practicante) => {
            setPracticanteEvaluar(practicante);
            setMostrarEvaluacion(true);
          }}
          mostrarNotificacion={mostrarNotificacion}
        />
      )}

      {mostrarEvaluacion && practicanteEvaluar && (
        <ModalEvaluacionFinal
          practicante={practicanteEvaluar}
          onClose={() => {
            setMostrarEvaluacion(false);
            setPracticanteEvaluar(null);
          }}
          onSuccess={async () => {
            await cargarDatos();
            setMostrarEvaluacion(false);
            setPracticanteEvaluar(null);
            setPracticanteSeleccionado(null);
            mostrarNotificacion('exito', 'Evaluación final completada exitosamente');
          }}
        />
      )}
    </div>
  );
}

// ============ COMPONENTES ============

function NavLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${active ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MobileNavLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition">
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
          <p className="text-sm text-gray-600">Publicada {new Date(oferta.fecha_publicacion || oferta.fecha_creacion).toLocaleDateString('es-CL')}</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Activa</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold">📨 {oferta.postulaciones_count ?? oferta.total_postulaciones ?? 0} postulaciones</span>
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

function PracticanteCard({ practicante, evaluacion, onClick, onEvaluar }) {
  const nombreCompleto = `${practicante.estudiante_nombre} ${practicante.apellido_paterno || ''} ${practicante.apellido_materno || ''}`.trim();
  const iniciales = `${practicante.estudiante_nombre?.charAt(0) || ''}${practicante.apellido_paterno?.charAt(0) || ''}`;
  
  const tieneEvaluacion = evaluacion?.existe;
  const estadoEvaluacion = evaluacion?.evaluacion?.estado_evaluacion;
  
  // Badge superior (estado general)
  let badgeEvaluacion = null;
  if (tieneEvaluacion) {
    if (estadoEvaluacion === 'completada') {
      badgeEvaluacion = {
        texto: '✅ Evaluado',
        clase: 'bg-emerald-100 text-emerald-700 border-emerald-300'
      };
    } else if (estadoEvaluacion === 'en_proceso') {
      badgeEvaluacion = {
        texto: '📝 En proceso',
        clase: 'bg-amber-100 text-amber-700 border-amber-300'
      };
    }
  } else if (practicante.progreso >= 80) {
    badgeEvaluacion = {
      texto: '⏳ Pendiente',
      clase: 'bg-orange-100 text-orange-700 border-orange-300'
    };
  }

  // Determinar qué mostrar en los botones
  const evaluacionCompletada = tieneEvaluacion && estadoEvaluacion === 'completada';
  const puedeEvaluar = !evaluacionCompletada && practicante.progreso >= 80;
  
  return (
    <div 
      className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 hover:shadow-lg hover:border-orange-400 transition group"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
          <span className="text-xl font-bold text-white">{iniciales}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight mb-1.5">{nombreCompleto}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
              🎓 {practicante.nombre_especialidad || 'Sin especialidad'}
            </span>
            {practicante.codigo_especialidad && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                {practicante.codigo_especialidad}
              </span>
            )}
          </div>
        </div>
      </div>

      {badgeEvaluacion && (
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${badgeEvaluacion.clase} font-bold text-sm`}>
            <span>{badgeEvaluacion.texto}</span>
          </div>
        </div>
      )}

      <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Práctica en:</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{practicante.titulo_oferta}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Progreso</span>
          <span className="font-bold text-orange-600">{practicante.progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-600 to-amber-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${practicante.progreso}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="p-2.5 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-500 mb-1 font-medium">Horas</p>
          <p className="font-bold text-gray-900 text-base">{practicante.horas_completadas}<span className="text-gray-500 font-normal">/{practicante.horas_requeridas}</span></p>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-500 mb-1 font-medium">Inicio</p>
          <p className="font-bold text-gray-900 text-sm">{new Date(practicante.fecha_inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</p>
        </div>
      </div>

      {/* BOTONES CONDICIONALES */}
      <div className="space-y-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full px-4 py-2.5 bg-white border-2 border-orange-300 text-orange-700 rounded-xl font-semibold hover:bg-orange-50 hover:border-orange-400 transition text-sm"
        >
          👁️ Ver detalles
        </button>
        
        {evaluacionCompletada ? (
          // Si está completada, mostrar badge grande
          <div className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-center border-2 border-emerald-400 shadow-md flex items-center justify-center gap-2">
            <span className="text-xl">✅</span>
            <span>Evaluación Completada</span>
          </div>
        ) : puedeEvaluar ? (
          // Si puede evaluar, mostrar botón
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEvaluar) onEvaluar(practicante);
            }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition text-sm shadow-md"
          >
            {tieneEvaluacion && estadoEvaluacion === 'en_proceso' ? '📝 Continuar Evaluación' : '📝 Evaluar'}
          </button>
        ) : (
          // Si no puede evaluar (progreso < 80%), mostrar mensaje
          <div className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-center text-sm">
            Evaluación disponible al 80% de progreso
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, gradient }) {
  return (
    <button onClick={onClick} className={`p-4 bg-gradient-to-br ${gradient} rounded-xl text-center transition-all group shadow-md hover:shadow-xl transform hover:-translate-y-1`}>
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-sm font-semibold text-white">{label}</p>
    </button>
  );
}

function SeccionOfertas({ ofertas, onNuevaOferta }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">💼 Mis Ofertas</h2>
          <p className="text-gray-600">Gestiona tus ofertas de práctica profesional</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 transition shadow-lg" onClick={onNuevaOferta}>
          ➕ Nueva Oferta
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6">
        {ofertas.length > 0 ? (
          <div className="space-y-4">
            {ofertas.map(oferta => <OfertaCard key={oferta.id_oferta} oferta={oferta} />)}
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

function SeccionPostulaciones({ postulaciones, onAceptar, onRechazar, respondiendoId, onVerDetalle }) {
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
                      <span className="text-xl font-bold text-white">{post.estudiante_nombre?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{post.estudiante_nombre}</p>
                      <p className="text-sm text-gray-600">{post.especialidad}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">⏳ Pendiente</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">Postulación a: <span className="font-semibold">{post.titulo_oferta}</span></p>
                <p className="text-sm text-gray-600 mb-4">
                  {(post.carta_motivacion && post.carta_motivacion.length > 0)
                    ? `${post.carta_motivacion.slice(0, 140)}${post.carta_motivacion.length > 140 ? '…' : ''}`
                    : 'Sin carta de motivación'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => onVerDetalle && onVerDetalle(post)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition">
                    Ver detalle
                  </button>
                  <button disabled={respondiendoId === post.id_postulacion} onClick={() => onAceptar(post)} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                    {respondiendoId === post.id_postulacion ? 'Procesando...' : '✓ Aceptar'}
                  </button>
                  <button disabled={respondiendoId === post.id_postulacion} onClick={() => onRechazar(post)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50">
                    {respondiendoId === post.id_postulacion ? 'Procesando...' : '✗ Rechazar'}
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

function SeccionPracticantes({ practicantes, evaluacionesPracticantes, onVerDetalle, onEvaluar }) {
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
              <PracticanteCard 
                key={practicante.id_practica} 
                practicante={practicante}
                evaluacion={evaluacionesPracticantes[practicante.id_practica]}
                onClick={() => onVerDetalle(practicante)}
                onEvaluar={onEvaluar}
              />
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

function ModalDetallePostulacion({ postulacion, onClose, onAceptar, onRechazar, respondiendoId }) {
  if (!postulacion) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900">Detalle de Postulación</h3>
            <p className="text-sm text-gray-600">{postulacion.estudiante_nombre} • {postulacion.especialidad}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-2xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-sm text-gray-600">Oferta</p>
            <p className="font-semibold text-gray-900">{postulacion.titulo_oferta}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Carta de motivación</p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-wrap text-sm text-gray-800">
              {postulacion.carta_motivacion || 'Sin carta de motivación'}
            </div>
          </div>
          <div className="text-xs text-gray-500">Fecha de postulación: {new Date(postulacion.fecha_postulacion).toLocaleString('es-CL')}</div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100">Cerrar</button>
          <button disabled={respondiendoId === postulacion.id_postulacion} onClick={onRechazar} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50">
            {respondiendoId === postulacion.id_postulacion ? 'Procesando...' : '✗ Rechazar'}
          </button>
          <button disabled={respondiendoId === postulacion.id_postulacion} onClick={onAceptar} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
            {respondiendoId === postulacion.id_postulacion ? 'Procesando...' : '✓ Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalValidarActividad({ actividad, onClose, onValidar, tipo, mostrarNotificacion }) {
  const [comentarios, setComentarios] = useState('');
  const [horas, setHoras] = useState(actividad?.horas_dedicadas || 0);
  const [validando, setValidando] = useState(false);

  const handleSubmit = async () => {
    if (tipo === 'rechazar' && !comentarios.trim()) {
      mostrarNotificacion('advertencia', 'Debes proporcionar un motivo de rechazo');
      return;
    }

    setValidando(true);
    try {
      await onValidar(comentarios, horas);
      onClose();
      mostrarNotificacion('exito', `Actividad ${tipo === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`);
    } catch (error) {
      setValidando(false);
      mostrarNotificacion('error', 'Error al validar la actividad');
    }
  };

  if (!actividad) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className={`px-6 py-4 ${tipo === 'aprobar' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-2xl">{tipo === 'aprobar' ? '✓' : '✗'}</span>
              </div>
              <div>
                <h3 className="text-xl font-black">
                  {tipo === 'aprobar' ? 'Aprobar Actividad' : 'Rechazar Actividad'}
                </h3>
                <p className="text-sm text-white/90">Revisa los detalles antes de confirmar</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Fecha</p>
                <p className="font-semibold text-gray-900">{new Date(actividad.fecha_actividad).toLocaleDateString('es-CL')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Horas Reportadas</p>
                <p className="font-semibold text-gray-900">{actividad.horas_dedicadas}h</p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Descripción de la actividad</p>
              <p className="text-sm text-gray-900">{actividad.descripcion_actividad}</p>
            </div>

            {actividad.equipos_utilizados && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Equipos utilizados</p>
                <p className="text-sm text-gray-700">{actividad.equipos_utilizados}</p>
              </div>
            )}

            {actividad.herramientas_utilizadas && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Herramientas utilizadas</p>
                <p className="text-sm text-gray-700">{actividad.herramientas_utilizadas}</p>
              </div>
            )}

            {actividad.normas_seguridad_aplicadas && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Normas de seguridad aplicadas</p>
                <p className="text-sm text-gray-700">{actividad.normas_seguridad_aplicadas}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Horas a validar {tipo === 'aprobar' && <span className="text-emerald-600">*</span>}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={actividad.horas_dedicadas}
              value={horas}
              onChange={(e) => setHoras(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: 8"
              disabled={tipo === 'rechazar'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {tipo === 'aprobar' 
                ? 'Puedes ajustar las horas si es necesario'
                : 'No se validarán horas para actividades rechazadas'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {tipo === 'aprobar' ? 'Comentarios (opcional)' : 'Motivo del rechazo'} 
              {tipo === 'rechazar' && <span className="text-red-600">*</span>}
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              placeholder={tipo === 'aprobar' 
                ? 'Ej: Buen trabajo, excelente atención a los detalles...'
                : 'Ej: La actividad no cumple con los requisitos mínimos porque...'}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={validando}
            className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={validando}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 ${
              tipo === 'aprobar' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {validando ? 'Procesando...' : tipo === 'aprobar' ? '✓ Confirmar Aprobación' : '✗ Confirmar Rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalDetallePracticanteNuevo({ practicante, evaluacion, onClose, onRefresh, onEvaluar, mostrarNotificacion }) {
  const [loading, setLoading] = useState(true);
  const [bitacora, setBitacora] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [tipoValidacion, setTipoValidacion] = useState(null);
  const [expandedActividad, setExpandedActividad] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const bitac = await getBitacoraPracticante(practicante.id_practica).catch(() => []);
      setBitacora(bitac);
    } catch (error) {
      console.error('Error cargando datos del practicante:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalValidacion = (actividad, tipo) => {
    setActividadSeleccionada(actividad);
    setTipoValidacion(tipo);
  };

  const handleValidar = async (comentarios, horas) => {
    try {
      await validarActividadBitacora(actividadSeleccionada.id_actividad_bitacora, {
        aprobada: tipoValidacion === 'aprobar',
        comentarios,
        horas_validadas: horas
      });
      await cargarDatos();
      if (onRefresh) onRefresh();
      setActividadSeleccionada(null);
      setTipoValidacion(null);
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const estadoEvaluacion = evaluacion?.evaluacion?.estado_evaluacion;
  const mostrarBotonEvaluar = 
    practicante.progreso >= 80 && 
    (!evaluacion?.existe || estadoEvaluacion !== 'completada');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl my-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{practicante.estudiante_nombre?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black">{practicante.estudiante_nombre}</h3>
                  <p className="text-white/90">{practicante.titulo_oferta}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Progreso</p>
                <p className="text-2xl font-black text-orange-600">{practicante.progreso}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Horas</p>
                <p className="text-2xl font-black text-gray-900">{practicante.horas_completadas}/{practicante.horas_requeridas}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Actividades</p>
                <p className="text-2xl font-black text-gray-900">{bitacora.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900 mb-4">📝 Bitácora de Actividades</h4>
              {bitacora.length > 0 ? bitacora.map(actividad => (
                <div key={actividad.id_actividad_bitacora} className="p-5 border-2 border-gray-200 rounded-2xl hover:border-orange-400 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-900">{new Date(actividad.fecha_actividad).toLocaleDateString('es-CL')}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">{actividad.horas_dedicadas}h</span>
                        
                        {actividad.estado_actividad === 'validada' && (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700">
                            ✓ Validada
                          </span>
                        )}
                        {actividad.estado_actividad === 'rechazada' && (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-red-100 text-red-700">
                            ✗ Rechazada
                          </span>
                        )}
                        {actividad.estado_actividad === 'pendiente' && (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700">
                            ⏳ Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{actividad.descripcion_actividad}</p>
                      
                      {(actividad.equipos_utilizados || actividad.herramientas_utilizadas || actividad.normas_seguridad_aplicadas) && (
                        <button
                          onClick={() => setExpandedActividad(expandedActividad === actividad.id_actividad_bitacora ? null : actividad.id_actividad_bitacora)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold mb-2"
                        >
                          {expandedActividad === actividad.id_actividad_bitacora ? '▼ Ocultar detalles' : '▶ Ver más detalles'}
                        </button>
                      )}

                      {expandedActividad === actividad.id_actividad_bitacora && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          {actividad.equipos_utilizados && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">Equipos utilizados:</p>
                              <p className="text-sm text-gray-700">{actividad.equipos_utilizados}</p>
                            </div>
                          )}
                          {actividad.herramientas_utilizadas && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">Herramientas utilizadas:</p>
                              <p className="text-sm text-gray-700">{actividad.herramientas_utilizadas}</p>
                            </div>
                          )}
                          {actividad.normas_seguridad_aplicadas && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700">Normas de seguridad:</p>
                              <p className="text-sm text-gray-700">{actividad.normas_seguridad_aplicadas}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {actividad.comentarios_empresa && actividad.comentarios_empresa.trim() && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs font-semibold text-orange-700 mb-1">Comentarios de la empresa:</p>
                          <p className="text-sm text-gray-700">{actividad.comentarios_empresa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {actividad.estado_actividad === 'pendiente' && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => abrirModalValidacion(actividad, 'aprobar')} 
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                      >
                        ✓ Aprobar
                      </button>
                      <button 
                        onClick={() => abrirModalValidacion(actividad, 'rechazar')} 
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📝</div>
                  <p className="font-semibold text-gray-900">Sin actividades registradas</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between gap-3">
            {mostrarBotonEvaluar && (
              <button 
                onClick={() => {
                  if (onEvaluar) onEvaluar(practicante);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition"
              >
                📝 Evaluar Práctica
              </button>
            )}
            
            <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition ml-auto">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {actividadSeleccionada && (
        <ModalValidarActividad
          actividad={actividadSeleccionada}
          tipo={tipoValidacion}
          onClose={() => {
            setActividadSeleccionada(null);
            setTipoValidacion(null);
          }}
          onValidar={handleValidar}
          mostrarNotificacion={mostrarNotificacion}
        />
      )}
    </>
  );
}