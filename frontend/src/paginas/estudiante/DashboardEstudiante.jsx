// 📁 Dashboard Estudiante - VERSIÓN FINAL COMPLETA CON TODAS LAS FUNCIONALIDADES
// ✅ Postulaciones con modal de éxito mejorado
// ✅ Cancelar postulaciones
// ✅ Bitácora de actividades
// ✅ Gestión de informes
// ✅ Notificaciones
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { cancelarPostulacion as apiCancelarPostulacion } from '../../servicios/api/estudiantesService';

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
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [showDetallePractica, setShowDetallePractica] = useState(false);
  const [showSubirInforme, setShowSubirInforme] = useState(false);
  const [informeSeleccionado, setInformeSeleccionado] = useState(null);
  
  // Estados para Postulaciones
  const [modalPostulacion, setModalPostulacion] = useState(false);
  const [ofertaParaPostular, setOfertaParaPostular] = useState(null);
  const [postulando, setPostulando] = useState(false);
  const [cancelandoPostulacion, setCancelandoPostulacion] = useState(null);
  const [mostrarExitoPostulacion, setMostrarExitoPostulacion] = useState(false);
  
  // Estados para Bitácora
  const [showBitacora, setShowBitacora] = useState(false);
  const [bitacoraData, setBitacoraData] = useState([]);
  const [loadingBitacora, setLoadingBitacora] = useState(false);
  const [showFormBitacora, setShowFormBitacora] = useState(false);
  const [bitacoraEdit, setBitacoraEdit] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      try {
        const resInformes = await api.get('/v1/estudiantes/mis-informes');
        setInformes(resInformes.data || []);
      } catch (err) {
        console.log('Endpoint de informes no disponible aún');
        setInformes([]);
      }
      
      try {
        const resNotificaciones = await api.get('/v1/estudiantes/notificaciones');
        setNotificaciones(resNotificaciones.data.notificaciones || []);
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

  // FUNCIONES PARA POSTULACIONES
  const abrirModalPostulacion = (oferta) => {
    if (oferta.ya_postulado) return;
    
    setOfertaParaPostular(oferta);
    setModalPostulacion(true);
  };

  const cerrarModalPostulacion = () => {
    setModalPostulacion(false);
    setOfertaParaPostular(null);
  };

  const handlePostular = async (cartaMotivacion) => {
    if (!ofertaParaPostular) return;
    
    setPostulando(true);
    try {
      const response = await api.post(
        `/v1/estudiantes/ofertas/${ofertaParaPostular.id_oferta}/postular`,
        { carta_motivacion: cartaMotivacion }
      );

      if (response.data.success) {
        cerrarModalPostulacion();
        setMostrarExitoPostulacion(true);
        await cargarDatos();
        
        // Auto-cerrar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setMostrarExitoPostulacion(false);
        }, 5000);
      }
    } catch (err) {
      alert('❌ Error al postular: ' + (err.response?.data?.error || err.message));
    } finally {
      setPostulando(false);
    }
  };

  const handleCancelarPostulacion = async (idPostulacion, tituloOferta) => {
  const ok = window.confirm(
    `¿Cancelar tu postulación a:\n\n"${tituloOferta}"?\n\nEsta acción no se puede deshacer.`
  );
  if (!ok) return;

  setCancelandoPostulacion(idPostulacion);
  try {
    const response = await apiCancelarPostulacion(idPostulacion); // <- helper PUT /cancelar
    if (response?.success) {                                      // <- response ya es el JSON
      alert('✅ Postulación cancelada exitosamente');
      await cargarDatos(); // ya lo tenías y refresca listas. :contentReference[oaicite:0]{index=0}
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    alert('❌ Error al cancelar postulación: ' + errorMsg);
  } finally {
    setCancelandoPostulacion(null);
  }
};

  // FUNCIONES PARA BITÁCORA
  const cargarBitacora = async (idPractica) => {
    if (!idPractica) return;
    
    setLoadingBitacora(true);
    try {
      const response = await api.get(`/v1/estudiantes/practicas/${idPractica}/bitacora`);
      setBitacoraData(response.data.bitacora || []);
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
      setBitacoraData([]);
    } finally {
      setLoadingBitacora(false);
    }
  };

  const abrirBitacora = (practica) => {
    if (!practica) {
      alert('⚠️ No tienes una práctica activa');
      return;
    }
    setPracticaSeleccionada(practica);
    setShowBitacora(true);
    cargarBitacora(practica.id_practica);
  };

  const cerrarBitacora = () => {
    setShowBitacora(false);
    setBitacoraData([]);
    setShowFormBitacora(false);
    setBitacoraEdit(null);
    setPracticaSeleccionada(null);
  };

  const abrirFormBitacora = (registro = null) => {
    setBitacoraEdit(registro);
    setShowFormBitacora(true);
  };

  const cerrarFormBitacora = () => {
    setShowFormBitacora(false);
    setBitacoraEdit(null);
  };

  const handleGuardarBitacora = async () => {
    await cargarBitacora(practicaSeleccionada.id_practica);
    cerrarFormBitacora();
  };

  const handleEliminarBitacora = async (idBitacora) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
      await api.delete(`/v1/estudiantes/practicas/${practicaSeleccionada.id_practica}/bitacora/${idBitacora}`);
      await cargarBitacora(practicaSeleccionada.id_practica);
      alert('✅ Registro eliminado exitosamente');
    } catch (err) {
      alert('❌ Error al eliminar registro: ' + err.message);
    }
  };

  const practicaActual = practicas.find(p => p.estado_practica === 'en_curso' || p.estado_practica === 'asignada');
  
  const calcularProgreso = (practica) => {
    if (!practica || !practica.horas_requeridas) return 0;
    return Math.min(Math.round((practica.horas_completadas / practica.horas_requeridas) * 100), 100);
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const abrirDetallePractica = (practica) => {
    setPracticaSeleccionada(practica);
    setShowDetallePractica(true);
  };

  const cerrarDetallePractica = () => {
    setShowDetallePractica(false);
    setPracticaSeleccionada(null);
  };

  const abrirSubirInforme = (numeroInforme = null) => {
    setInformeSeleccionado(numeroInforme);
    setShowSubirInforme(true);
  };

  const cerrarSubirInforme = () => {
    setShowSubirInforme(false);
    setInformeSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-bold text-gray-900">Cargando tu dashboard...</p>
          <p className="text-gray-600">Preparando toda tu información</p>
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
      {/* Mensaje de Éxito de Postulación */}
      {mostrarExitoPostulacion && (
        <MensajeExitoPostulacion onClose={() => setMostrarExitoPostulacion(false)} />
      )}

      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">SIGGIP</h1>
                <p className="text-xs text-gray-600">Portal Estudiante</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <NavLink icon="🏠" label="Inicio" active={activeSection === 'inicio'} onClick={() => setActiveSection('inicio')} />
              <NavLink icon="💼" label="Prácticas" active={activeSection === 'practicas'} onClick={() => setActiveSection('practicas')} />
              <NavLink icon="📨" label="Postulaciones" active={activeSection === 'postulaciones'} onClick={() => setActiveSection('postulaciones')} />
              <NavLink icon="📝" label="Informes" active={activeSection === 'informes'} onClick={() => setActiveSection('informes')} />
              <NavLink icon="🔍" label="Buscar" active={activeSection === 'buscar'} onClick={() => setActiveSection('buscar')} />
            </div>

            <div className="flex items-center gap-4">
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
              <MobileNavLink icon="💼" label="Prácticas" onClick={() => { setActiveSection('practicas'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="📨" label="Postulaciones" onClick={() => { setActiveSection('postulaciones'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="📝" label="Informes" onClick={() => { setActiveSection('informes'); setShowMobileMenu(false); }} />
              <MobileNavLink icon="🔍" label="Buscar" onClick={() => { setActiveSection('buscar'); setShowMobileMenu(false); }} />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modal de Postulación */}
        {modalPostulacion && ofertaParaPostular && (
          <ModalPostulacion
            oferta={ofertaParaPostular}
            onClose={cerrarModalPostulacion}
            onPostular={handlePostular}
            postulando={postulando}
          />
        )}

        {/* Modal de Bitácora */}
        {showBitacora && practicaSeleccionada && (
          <ModalBitacora
            practica={practicaSeleccionada}
            bitacora={bitacoraData}
            loading={loadingBitacora}
            onClose={cerrarBitacora}
            onNuevoRegistro={() => abrirFormBitacora()}
            onEditarRegistro={abrirFormBitacora}
            onEliminarRegistro={handleEliminarBitacora}
          />
        )}

        {/* Formulario de Bitácora */}
        {showFormBitacora && (
          <FormularioBitacora
            practica={practicaSeleccionada}
            registroEdit={bitacoraEdit}
            onClose={cerrarFormBitacora}
            onGuardar={handleGuardarBitacora}
          />
        )}

        {showDetallePractica && practicaSeleccionada && (
          <DetallePracticaModal 
            practica={practicaSeleccionada} 
            onClose={cerrarDetallePractica}
            onSubirInforme={() => {
              cerrarDetallePractica();
              abrirSubirInforme();
            }}
            onVerBitacora={() => {
              cerrarDetallePractica();
              abrirBitacora(practicaSeleccionada);
            }}
          />
        )}

        {showSubirInforme && (
          <SubirInformeModal
            idPractica={practicaActual?.id_practica}
            numeroInforme={informeSeleccionado}
            onClose={cerrarSubirInforme}
            onGuardar={() => {
              cerrarSubirInforme();
              cargarDatos();
            }}
          />
        )}

        {activeSection === 'inicio' && (
          <SeccionInicio 
            perfil={perfil}
            estadisticas={estadisticas}
            practicaActual={practicaActual}
            calcularProgreso={calcularProgreso}
            ofertas={ofertas}
            postulaciones={postulaciones}
            abrirDetallePractica={abrirDetallePractica}
            abrirSubirInforme={abrirSubirInforme}
            abrirBitacora={abrirBitacora}
            abrirModalPostulacion={abrirModalPostulacion}
            setActiveSection={setActiveSection}
            onCancelarPostulacion={handleCancelarPostulacion}
            cancelandoPostulacion={cancelandoPostulacion}
          />
        )}

        {activeSection === 'informes' && (
          <SeccionInformes 
            informes={informes}
            practicaActual={practicaActual}
            onSubirInforme={abrirSubirInforme}
          />
        )}

        {activeSection === 'buscar' && (
          <BuscarOfertas 
            ofertas={ofertas} 
            onPostular={abrirModalPostulacion}
            practicaActual={practicaActual}
          />
        )}

        {activeSection === 'practicas' && (
          <MisPracticas 
            practicas={practicas} 
            onVerDetalle={abrirDetallePractica} 
          />
        )}

        {activeSection === 'postulaciones' && (
          <SeccionPostulaciones
            postulaciones={postulaciones}
            onCancelar={handleCancelarPostulacion}
            cancelando={cancelandoPostulacion}
          />
        )}
      </main>
    </div>
  );
}

// ============ MENSAJE DE ÉXITO DE POSTULACIÓN ============
function MensajeExitoPostulacion({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">¡Postulación Enviada!</h2>
          <p className="text-emerald-100 text-lg">Tu solicitud ha sido enviada con éxito</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📬</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">¿Qué sigue ahora?</p>
                <p className="text-sm text-gray-600">La empresa revisará tu postulación y te notificará sobre su decisión.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">Mantente atento</p>
                <p className="text-sm text-gray-600">Recibirás una notificación cuando haya novedades sobre tu postulación.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">💼</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">Mientras tanto...</p>
                <p className="text-sm text-gray-600">Puedes seguir explorando otras ofertas y postular a más oportunidades.</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
          >
            ¡Entendido! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ SECCIÓN POSTULACIONES ============
function SeccionPostulaciones({ postulaciones, onCancelar, cancelando }) {
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  const postulacionesFiltradas = postulaciones.filter(post => {
    if (filtroEstado === 'todas') return true;
    return post.estado_postulacion === filtroEstado;
  });

  const contadores = {
    total: postulaciones.length,
    pendiente: postulaciones.filter(p => p.estado_postulacion === 'pendiente').length,
    en_revision: postulaciones.filter(p => p.estado_postulacion === 'en_revision').length,
    aceptada: postulaciones.filter(p => p.estado_postulacion === 'aceptada').length,
    rechazada: postulaciones.filter(p => p.estado_postulacion === 'rechazada').length,
    cancelada: postulaciones.filter(p => p.estado_postulacion === 'cancelada').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">📨 Mis Postulaciones</h2>
          <p className="text-gray-600">Gestiona todas tus solicitudes de práctica</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <button
          onClick={() => setFiltroEstado('todas')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'todas' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-blue-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.total}</div>
          <div className="text-xs font-semibold">Total</div>
        </button>
        
        <button
          onClick={() => setFiltroEstado('pendiente')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'pendiente' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-amber-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.pendiente}</div>
          <div className="text-xs font-semibold">Pendientes</div>
        </button>
        
        <button
          onClick={() => setFiltroEstado('en_revision')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'en_revision' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-blue-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.en_revision}</div>
          <div className="text-xs font-semibold">En Revisión</div>
        </button>
        
        <button
          onClick={() => setFiltroEstado('aceptada')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'aceptada' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-emerald-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.aceptada}</div>
          <div className="text-xs font-semibold">Aceptadas</div>
        </button>
        
        <button
          onClick={() => setFiltroEstado('rechazada')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'rechazada' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-red-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.rechazada}</div>
          <div className="text-xs font-semibold">Rechazadas</div>
        </button>
        
        <button
          onClick={() => setFiltroEstado('cancelada')}
          className={`p-4 rounded-2xl transition ${filtroEstado === 'cancelada' ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 hover:border-gray-300'}`}
        >
          <div className="text-3xl font-black mb-1">{contadores.cancelada}</div>
          <div className="text-xs font-semibold">Canceladas</div>
        </button>
      </div>

      {/* Lista de Postulaciones */}
      {postulacionesFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {postulacionesFiltradas.map(postulacion => (
            <PostulacionCardDetallada
              key={postulacion.id_postulacion}
              postulacion={postulacion}
              onCancelar={onCancelar}
              cancelando={cancelando}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filtroEstado === 'todas' ? 'Sin postulaciones' : `Sin postulaciones ${filtroEstado}`}
          </h3>
          <p className="text-gray-600">
            {filtroEstado === 'todas' 
              ? 'Aún no has postulado a ninguna oferta'
              : `No tienes postulaciones con estado: ${filtroEstado}`
            }
          </p>
        </div>
      )}
    </div>
  );
}

// ============ CARD DETALLADA DE POSTULACIÓN ============
function PostulacionCardDetallada({ postulacion, onCancelar, cancelando }) {
  const [expanded, setExpanded] = useState(false);
  
  const estados = {
    pendiente: { 
      bg: 'bg-amber-100', 
      text: 'text-amber-700', 
      icon: '⏳', 
      label: 'Pendiente',
      borderColor: 'border-amber-300',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600'
    },
    aceptada: { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      icon: '✓', 
      label: 'Aceptada',
      borderColor: 'border-emerald-300',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600'
    },
    rechazada: { 
      bg: 'bg-red-100', 
      text: 'text-red-700', 
      icon: '✗', 
      label: 'Rechazada',
      borderColor: 'border-red-300',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-pink-600'
    },
    en_revision: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      icon: '👁️', 
      label: 'En Revisión',
      borderColor: 'border-blue-300',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600'
    },
    cancelada: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-700', 
      icon: '🚫', 
      label: 'Cancelada',
      borderColor: 'border-gray-300',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-gray-600'
    }
  };
  const config = estados[postulacion.estado_postulacion] || estados.pendiente;
  
  const puedeCancelar = ['pendiente', 'en_revision'].includes(postulacion.estado_postulacion);

  return (
    <div className={`bg-white border-2 ${config.borderColor} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition`}>
      {/* Header con gradiente */}
      <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{postulacion.titulo_oferta}</h3>
            <p className="text-white/90 flex items-center gap-2">
              <span>🏢</span> {postulacion.empresa_nombre}
            </p>
          </div>
          <span className={`px-4 py-2 bg-white/20 backdrop-blur rounded-full font-bold text-white flex items-center gap-2 whitespace-nowrap`}>
            {config.icon} {config.label}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1 font-semibold">📅 FECHA DE POSTULACIÓN</p>
            <p className="font-bold text-gray-900">
              {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          {postulacion.fecha_respuesta && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1 font-semibold">📬 FECHA DE RESPUESTA</p>
              <p className="font-bold text-gray-900">
                {new Date(postulacion.fecha_respuesta).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {postulacion.carta_motivacion && (
          <div className="mb-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-between"
            >
              <span>📝 Carta de Motivación</span>
              <span>{expanded ? '▲ Ver menos' : '▼ Ver más'}</span>
            </button>
            
            {expanded && (
              <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-l-4 border-blue-500">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {postulacion.carta_motivacion}
                </p>
              </div>
            )}
          </div>
        )}

        {postulacion.comentarios_empresa && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl mb-4">
            <p className="text-xs text-blue-700 font-bold mb-2">💬 COMENTARIOS DE LA EMPRESA:</p>
            <p className="text-sm text-blue-900 leading-relaxed">{postulacion.comentarios_empresa}</p>
          </div>
        )}

        {puedeCancelar && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onCancelar(postulacion.id_postulacion, postulacion.titulo_oferta)}
              disabled={cancelando === postulacion.id_postulacion}
              className="w-full px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {cancelando === postulacion.id_postulacion ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelando Postulación...
                </>
              ) : (
                <>🗑️ Cancelar Postulación</>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SECCIÓN INICIO ============
function SeccionInicio({ perfil, estadisticas, practicaActual, calcularProgreso, ofertas, postulaciones, abrirDetallePractica, abrirSubirInforme, abrirBitacora, abrirModalPostulacion, setActiveSection, onCancelarPostulacion, cancelandoPostulacion }) {
  return (
    <>
      {/* BANNER DE BIENVENIDA MEJORADO */}
      <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
        {/* Patrón animado de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="relative z-10">
          {/* Badge de bienvenida */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full mb-6 shadow-xl">
            <span className="text-3xl animate-wave">👋</span>
            <p className="text-white font-black text-lg">Bienvenido de nuevo</p>
          </div>
          
          {/* Nombre y especialidad */}
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
              ¡Hola, {perfil?.nombre}!
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-lg">
              <span className="px-5 py-2 bg-white/20 backdrop-blur-xl rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-white/30 transition">
                <span className="text-xl">🎓</span> {perfil?.nombre_especialidad}
              </span>
              <span className="px-5 py-2 bg-white/20 backdrop-blur-xl rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-white/30 transition">
                <span className="text-xl">📚</span> {perfil?.nivel_academico}
              </span>
            </div>
          </div>

          {/* Stats mejoradas con animaciones */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QuickStatMejorado 
              icon="💼" 
              value={estadisticas?.practicas_en_curso || 0} 
              label="En Curso"
              color="from-blue-500 to-cyan-500"
            />
            <QuickStatMejorado 
              icon="⏱️" 
              value={`${estadisticas?.horas_completadas || 0}h`} 
              label="Horas"
              color="from-purple-500 to-pink-500"
            />
            <QuickStatMejorado 
              icon="📨" 
              value={estadisticas?.postulaciones_activas || 0} 
              label="Postulaciones"
              color="from-emerald-500 to-teal-500"
            />
            <QuickStatMejorado 
              icon="📋" 
              value={estadisticas?.informes_aprobados || 0} 
              label="Informes"
              color="from-orange-500 to-red-500"
            />
            <QuickStatMejorado 
              icon="🏆" 
              value={estadisticas?.practicas_completadas || 0} 
              label="Completadas"
              color="from-yellow-500 to-amber-500"
            />
          </div>
        </div>
      </div>

      {/* KPIs MEJORADOS */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Mis Indicadores de Desempeño
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <KPICardMejorado
            titulo="Cobertura de Prácticas"
            valor={`${estadisticas?.practicas_en_curso || 0}/${estadisticas?.practicas_requeridas || 1}`}
            porcentaje={Math.round(((estadisticas?.practicas_en_curso || 0) / (estadisticas?.practicas_requeridas || 1)) * 100)}
            color="blue"
            icono="📊"
          />
          <KPICardMejorado
            titulo="Informes Validados"
            valor={`${estadisticas?.informes_aprobados || 0}/3`}
            porcentaje={Math.round(((estadisticas?.informes_aprobados || 0) / 3) * 100)}
            color="purple"
            icono="📝"
          />
          <KPICardMejorado
            titulo="Tasa de Aceptación"
            valor={`${estadisticas?.tasa_aceptacion || 0}%`}
            porcentaje={estadisticas?.tasa_aceptacion || 0}
            color="emerald"
            icono="✅"
          />
        </div>
      </div>

      
      {practicaActual ? (
        <>
          <PracticaActualCard 
            practica={practicaActual}
            calcularProgreso={calcularProgreso}
            abrirDetallePractica={abrirDetallePractica}
            abrirSubirInforme={abrirSubirInforme}
            abrirBitacora={abrirBitacora}
          />

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl">
                💼
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Ya tienes una práctica activa
                </h3>
                <p className="text-gray-700">
                  Actualmente estás realizando tu práctica en <strong>{practicaActual.empresa_nombre}</strong>. 
                  Podrás postular a nuevas ofertas una vez que completes esta práctica.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
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

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Ofertas Destacadas</h3>
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
                  <OfertaCardMejorada 
                    key={oferta.id_oferta} 
                    oferta={oferta} 
                    onPostular={abrirModalPostulacion}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900">Mis Postulaciones</h3>
                <button 
                  onClick={() => setActiveSection('postulaciones')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Ver todas →
                </button>
              </div>
              <div className="space-y-3">
                {postulaciones.length > 0 ? (
                  postulaciones.slice(0, 5).map(post => (
                    <PostulacionCard 
                      key={post.id_postulacion} 
                      postulacion={post}
                      onCancelar={onCancelarPostulacion}
                      cancelando={cancelandoPostulacion}
                    />
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
    </>
  );
}

// ============ PRÁCTICA ACTUAL CARD ============
// 🎯 Sin requisitos, con diseño más profesional y funcional

function PracticaActualCard({ practica, calcularProgreso, abrirDetallePractica, abrirSubirInforme, abrirBitacora }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTelefono, setCopiedTelefono] = useState(false);
  const [copiedEmailProf, setCopiedEmailProf] = useState(false);
  const [copiedTelProf, setCopiedTelProf] = useState(false);
  
  const progreso = calcularProgreso(practica);
  // Fecha término calculada dinámicamente (+40 días si no viene del backend)
  const fechaInicioPractica = practica?.fecha_inicio_practica ? new Date(practica.fecha_inicio_practica) : null;
  let fechaTerminoCalculada = null;
  if (fechaInicioPractica) {
    if (practica?.fecha_termino_practica) {
      fechaTerminoCalculada = new Date(practica.fecha_termino_practica);
    } else {
      fechaTerminoCalculada = new Date(fechaInicioPractica);
      fechaTerminoCalculada.setDate(fechaTerminoCalculada.getDate() + 40);
    }
  }

  // Evitar días negativos si la fecha de inicio es futura
  const diasTranscurridosRaw = fechaInicioPractica
    ? Math.floor((new Date() - fechaInicioPractica) / (1000 * 60 * 60 * 24))
    : 0;
  const diasTranscurridos = Math.max(0, diasTranscurridosRaw);
  const diasTotales = fechaInicioPractica && fechaTerminoCalculada
    ? Math.floor((fechaTerminoCalculada - fechaInicioPractica) / (1000 * 60 * 60 * 24))
    : 0;
  const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* 🎯 HEADER  con Barra de Progreso Grande */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-bold text-white flex items-center gap-2">
                <span>⚡</span> PRÁCTICA EN CURSO
              </span>
              <span className="px-4 py-2 bg-emerald-500/90 backdrop-blur rounded-full text-sm font-bold text-white">
                {progreso}% Completado
              </span>
              <EstadoPracticaBadge estado={practica.estado_practica} />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
              {practica.titulo_oferta}
            </h3>
            
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <span className="flex items-center gap-2 text-base">
                <span className="text-2xl">🏢</span>
                <span className="font-semibold">{practica.empresa_nombre}</span>
              </span>
              <span className="flex items-center gap-2 text-base">
                <span className="text-2xl">📍</span>
                <span>{practica.ubicacion || practica.comuna || 'No especificado'}</span>
              </span>
              <span className="flex items-center gap-2 text-base">
                <span className="text-2xl">⏰</span>
                <span className="font-bold">{practica.horas_completadas}h / {practica.horas_requeridas}h</span>
              </span>
            </div>
          </div>
          
          {/* Botón Rápido Bitácora MEJORADO */}
          <button
            onClick={() => abrirBitacora(practica)}
            className="px-6 py-4 bg-white text-purple-600 rounded-2xl font-bold hover:bg-white/90 transition shadow-2xl flex items-center gap-2 flex-shrink-0 hover:scale-105"
          >
            <span className="text-2xl">📔</span>
            <span className="hidden sm:inline">Bitácora</span>
          </button>
        </div>

        {/* Barra de progreso animada y grande */}
        <div className="relative">
          <div className="flex items-center justify-between text-white text-sm font-bold mb-2">
            <span>Progreso General de la Práctica</span>
            <span>{progreso}% • {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Finalizado'}</span>
          </div>
          <div className="h-5 bg-white/20 rounded-full overflow-hidden backdrop-blur">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${progreso}%` }}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between text-white/70 text-xs mt-2 font-semibold">
            <span>📅 {new Date(practica.fecha_inicio_practica).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>🎯 {new Date(practica.fecha_termino_practica).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* 🏢 INFORMACIÓN DE LA EMPRESA - SUPER MEJORADA */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-300 shadow-xl relative overflow-hidden">
          {/* Círculo decorativo de fondo */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-3xl"></div>
          
          {/* Header Empresa MEJORADO */}
          <div className="relative flex items-center gap-6 mb-8 pb-6 border-b-2 border-blue-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0 hover:scale-110 transition">
              <span className="text-6xl">🏢</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-3xl font-black text-gray-900 mb-2 break-words">
                {practica.empresa_nombre}
              </h4>
              {practica.nombre_comercial && practica.nombre_comercial !== practica.empresa_nombre && (
                <p className="text-base text-gray-600 italic mb-2">({practica.nombre_comercial})</p>
              )}
              {practica.sector_economico && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold flex items-center gap-2 shadow-md">
                    <span>📊</span> {practica.sector_economico}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Información - Diseño Premium */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Columna : Ubicación y Modalidad */}
            <div className="space-y-4">
              {/* Ubicación */}
              <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-blue-300 transition group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
                    <span className="text-3xl">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Ubicación</p>
                    <p className="font-black text-gray-900 text-lg leading-tight">
                      {practica.ubicacion || practica.direccion_empresa || 'No especificada'}
                    </p>
                    {practica.comuna && practica.region && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <span>🏙️</span> {practica.comuna}, {practica.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modalidad */}
              <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition">
                    <span className="text-3xl">💼</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Modalidad de Trabajo</p>
                    <p className="font-black text-gray-900 text-lg capitalize">
                      {practica.modalidad_trabajo || 'Presencial'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Horario */}
              {practica.horario_trabajo && (
                <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-orange-300 transition group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition">
                      <span className="text-3xl">🕐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Horario</p>
                      <p className="font-black text-gray-900 text-lg">{practica.horario_trabajo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna : Contacto */}
            <div className="space-y-4">
              {/* Teléfono */}
              {practica.telefono_empresa && (
                <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-green-300 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition">
                        <span className="text-3xl">📞</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Teléfono</p>
                        <p className="font-black text-gray-900 text-lg">{practica.telefono_empresa}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(practica.telefono_empresa, setCopiedTelefono)}
                      className="p-3 hover:bg-gray-100 rounded-xl transition flex-shrink-0 group"
                      title="Copiar teléfono"
                    >
                      <span className="text-2xl">{copiedTelefono ? '✅' : '📋'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Email */}
              {practica.email_empresa && (
                <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-blue-300 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
                        <span className="text-3xl">✉️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Correo Electrónico</p>
                        <p className="font-bold text-gray-900 text-sm break-all">{practica.email_empresa}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(practica.email_empresa, setCopiedEmail)}
                      className="p-3 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
                      title="Copiar email"
                    >
                      <span className="text-2xl">{copiedEmail ? '✅' : '📋'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Salario */}
              {practica.salario_referencial && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 shadow-lg hover:shadow-2xl transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Remuneración Referencial</p>
                      <p className="font-black text-emerald-700 text-2xl">
                        ${Number(practica.salario_referencial).toLocaleString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Monto referencial mensual</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Beneficios */}
          {practica.beneficios && (
            <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🎁</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Beneficios Adicionales</p>
                  <p className="text-gray-900 leading-relaxed">{practica.beneficios}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/*PROFESOR GUÍA*/}
        {practica.profesor_nombre && (
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-3xl p-8 border-2 border-purple-300 shadow-xl relative overflow-hidden">
            {/* Círculo decorativo de fondo */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
            
            {/* Header Profesor MEJORADO */}
            <div className="relative flex items-center gap-6 mb-8 pb-6 border-b-2 border-purple-200">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 hover:scale-110 transition">
                <span className="text-5xl font-black text-white">
                  {practica.profesor_nombre?.charAt(0)}{practica.profesor_apellido?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-3xl font-black text-gray-900 mb-1 break-words">
                  {practica.profesor_nombre} {practica.profesor_apellido}
                  {practica.profesor_apellido_materno && ` ${practica.profesor_apellido_materno}`}
                </h4>
                <p className="text-purple-600 font-bold text-lg flex items-center gap-2">
                  <span>👨‍🏫</span> Profesor Guía
                </p>
              </div>
            </div>

            {/* Grid de Información */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Email */}
              {practica.profesor_email && (
                <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition">
                        <span className="text-3xl">✉️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Correo Electrónico</p>
                        <p className="font-bold text-gray-900 text-sm break-all">{practica.profesor_email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(practica.profesor_email, setCopiedEmailProf)}
                      className="p-3 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
                      title="Copiar email"
                    >
                      <span className="text-2xl">{copiedEmailProf ? '✅' : '📋'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Teléfono */}
              {practica.profesor_telefono && (
                <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition">
                        <span className="text-3xl">📞</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Teléfono</p>
                        <p className="font-black text-gray-900 text-lg">{practica.profesor_telefono}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(practica.profesor_telefono, setCopiedTelProf)}
                      className="p-3 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
                      title="Copiar teléfono"
                    >
                      <span className="text-2xl">{copiedTelProf ? '✅' : '📋'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nota informativa mejorada */}
            <div className="mt-6 p-5 bg-purple-100 rounded-2xl border-l-4 border-purple-600 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm text-purple-900 leading-relaxed">
                    <strong className="font-black">Importante:</strong> Tu profesor guía está disponible para resolver dudas sobre tu práctica, revisar tu bitácora y validar tus informes de avance.
                  </p>
                </div>
              </div>
            </div>

            {/* Horario de atención NUEVO */}
            <div className="mt-4 p-5 bg-white rounded-2xl border-2 border-purple-200 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🕐</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Horario de Atención</p>
                  <p className="text-gray-900 font-semibold mb-1">Lunes a Viernes: 09:00 - 18:00 hrs</p>
                  <p className="text-xs text-gray-600">💬 Responde consultas en un plazo de 24-48 horas hábiles</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📊 PROGRESO Y CRONOGRAMA - REDISEÑADO */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Progreso Circular Mejorado */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-300 shadow-xl">
            <div className="relative w-52 h-52 mb-6">
              <svg className="transform -rotate-90 w-52 h-52">
                {/* Círculo de fondo */}
                <circle cx="104" cy="104" r="90" stroke="#e5e7eb" strokeWidth="16" fill="none" />
                {/* Círculo de progreso con gradiente */}
                <circle 
                  cx="104" 
                  cy="104" 
                  r="90" 
                  stroke="url(#gradProgress)" 
                  strokeWidth="16" 
                  fill="none" 
                  strokeDasharray={`${progreso * 5.65} 565`} 
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradProgress" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-gray-900 mb-1">{progreso}%</span>
                <span className="text-sm text-gray-600 font-bold">Completado</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-600 mb-2">{practica.horas_completadas}h</p>
              <p className="text-gray-700 font-semibold text-lg">
                de <span className="font-black text-2xl text-gray-900">{practica.horas_requeridas}h</span> requeridas
              </p>
            </div>
          </div>

          {/* Timeline Mejorado */}
          <div className="space-y-5">
            {/* Fecha de Inicio */}
            <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl border-l-4 border-blue-600 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-sm text-blue-800 font-black uppercase tracking-wide">Fecha de Inicio</p>
              </div>
              <p className="text-2xl font-black text-gray-900 ml-16">
                {new Date(practica.fecha_inicio_practica).toLocaleDateString('es-CL', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Fecha de Término */}
            <div className="p-6 bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl border-l-4 border-purple-600 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-3xl">🎯</span>
                </div>
                <p className="text-sm text-purple-800 font-black uppercase tracking-wide">Fecha de Término</p>
              </div>
              <p className="text-2xl font-black text-gray-900 ml-16">
                {fechaTerminoCalculada
                  ? fechaTerminoCalculada.toLocaleDateString('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '—'}
              </p>
            </div>

            {/* Contador de Días */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl text-center border-2 border-orange-300 shadow-lg hover:shadow-xl transition hover:scale-105">
                <p className="text-5xl font-black text-orange-600 mb-2">{diasTranscurridos}</p>
                <p className="text-xs text-gray-700 font-bold uppercase tracking-wide">Días transcurridos</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl text-center border-2 border-amber-300 shadow-lg hover:shadow-xl transition hover:scale-105">
                <p className="text-5xl font-black text-amber-600 mb-2">{diasRestantes > 0 ? diasRestantes : 0}</p>
                <p className="text-xs text-gray-700 font-bold uppercase tracking-wide">Días restantes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {practica.descripcion && (
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl border-l-4 border-blue-600 shadow-lg">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-black mb-3 uppercase tracking-wide">Descripción de la Práctica</p>
                <p className="text-gray-900 leading-relaxed text-lg">{practica.descripcion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-8 border-t-2 border-gray-200">
          <button 
            onClick={() => abrirDetallePractica(practica)}
            className="group px-6 py-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-xl hover:shadow-2xl hover:scale-105 flex flex-col items-center justify-center gap-3"
          >
            <span className="text-4xl group-hover:scale-110 transition">📋</span>
            <span className="text-sm">Ver Detalles</span>
          </button>
          
          <button 
            onClick={() => abrirSubirInforme()}
            className="group px-6 py-5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-xl hover:shadow-2xl hover:scale-105 flex flex-col items-center justify-center gap-3"
          >
            <span className="text-4xl group-hover:scale-110 transition">📤</span>
            <span className="text-sm">Subir Informe</span>
          </button>
          
          <button 
            onClick={() => abrirBitacora(practica)}
            className="group px-6 py-5 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-xl hover:shadow-2xl hover:scale-105 flex flex-col items-center justify-center gap-3"
          >
            <span className="text-4xl group-hover:scale-110 transition">📔</span>
            <span className="text-sm">Bitácora</span>
          </button>

          <button 
            className="group px-6 py-5 bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl font-bold hover:from-orange-700 hover:to-red-700 transition shadow-xl hover:shadow-2xl hover:scale-105 flex flex-col items-center justify-center gap-3"
          >
            <span className="text-4xl group-hover:scale-110 transition">📊</span>
            <span className="text-sm">Ver Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ ESTILOS CSS ADICIONALES ============
// Agregar al archivo CSS global o dentro de un <style> tag

/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/

// ============ MODAL DE POSTULACIÓN ============
function ModalPostulacion({ oferta, onClose, onPostular, postulando }) {
  const [cartaMotivacion, setCartaMotivacion] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      alert('⚠️ Debes aceptar los términos y condiciones');
      return;
    }
    if (cartaMotivacion.length < 100) {
      alert('⚠️ La carta de motivación debe tener al menos 100 caracteres');
      return;
    }
    onPostular(cartaMotivacion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-white mb-2">📨 Postular a Práctica</h2>
              <p className="text-yellow-100">{oferta.titulo_oferta}</p>
            </div>
            <button 
              onClick={onClose}
              disabled={postulando}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition disabled:opacity-50"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Información de la oferta */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">📋 Detalles de la Oferta</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-xs text-gray-600">Empresa</p>
                  <p className="font-bold text-gray-900">{oferta.empresa_nombre}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <p className="text-xs text-gray-600">Duración</p>
                    <p className="font-semibold text-gray-900">{oferta.duracion_horas}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-xs text-gray-600">Modalidad</p>
                    <p className="font-semibold text-gray-900">{oferta.modalidad_trabajo}</p>
                  </div>
                </div>
              </div>

              {oferta.salario_referencial && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-xs text-gray-600">Salario Referencial</p>
                    <p className="font-bold text-emerald-600">
                      ${Number(oferta.salario_referencial).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Descripción</p>
                <p className="text-sm text-gray-900">{oferta.descripcion}</p>
              </div>

              {oferta.requisitos && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Requisitos</p>
                  <p className="text-sm text-gray-900">{oferta.requisitos}</p>
                </div>
              )}
            </div>
          </div>

          {/* Carta de Motivación */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Carta de Motivación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cartaMotivacion}
              onChange={(e) => setCartaMotivacion(e.target.value)}
              required
              rows={8}
              placeholder="Cuéntale a la empresa por qué te interesa esta práctica y qué puedes aportar..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none resize-none"
              disabled={postulando}
            />
            <p className="text-xs text-gray-500 mt-2">
              {cartaMotivacion.length}/500 caracteres • Mínimo 100 caracteres
            </p>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                disabled={postulando}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="terminos" className="text-sm text-gray-700">
                <strong>Acepto los términos y condiciones:</strong> Entiendo que al postular, 
                mi información será compartida con la empresa y que debo cumplir con los 
                compromisos establecidos en caso de ser seleccionado.
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={postulando || cartaMotivacion.length < 100 || !aceptaTerminos}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {postulando ? '⏳ Enviando...' : '📨 Enviar Postulación'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={postulando}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MODAL DE BITÁCORA ============
function ModalBitacora({ practica, bitacora, loading, onClose, onNuevoRegistro, onEditarRegistro, onEliminarRegistro }) {
  const totalHoras = bitacora.reduce((sum, reg) => sum + (reg.horas_trabajadas || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-white mb-2">📔 Mi Bitácora de Actividades</h2>
              <p className="text-indigo-100">{practica.titulo_oferta}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Resumen */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="text-4xl font-black text-blue-600 mb-2">{bitacora.length}</div>
              <p className="text-sm text-gray-700 font-semibold">Total de Registros</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
              <div className="text-4xl font-black text-purple-600 mb-2">{totalHoras}</div>
              <p className="text-sm text-gray-700 font-semibold">Horas Registradas</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6">
              <div className="text-4xl font-black text-emerald-600 mb-2">
                {practica.horas_completadas || 0}
              </div>
              <p className="text-sm text-gray-700 font-semibold">Horas Aprobadas</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
              <div className="text-4xl font-black text-orange-600 mb-2">
                {Math.round(((practica.horas_completadas || 0) / (practica.horas_requeridas || 1)) * 100)}%
              </div>
              <p className="text-sm text-gray-700 font-semibold">Progreso</p>
            </div>
          </div>

          {/* Botón nuevo registro */}
          <button
            onClick={onNuevoRegistro}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
          >
            ➕ Registrar Nueva Actividad
          </button>

          {/* Lista de registros */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando bitácora...</p>
              </div>
            </div>
          ) : bitacora.length > 0 ? (
            <div className="space-y-4">
              {bitacora.map(registro => (
                <BitacoraCard
                  key={registro.id_bitacora}
                  registro={registro}
                  onEditar={() => onEditarRegistro(registro)}
                  onEliminar={() => onEliminarRegistro(registro.id_bitacora)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-12 text-center">
              <span className="text-6xl mb-4 block">📔</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin registros aún</h3>
              <p className="text-gray-600 mb-6">Comienza a registrar tus actividades diarias</p>
              <button
                onClick={onNuevoRegistro}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition"
              >
                ➕ Crear Primer Registro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ CARD DE REGISTRO DE BITÁCORA ============
function BitacoraCard({ registro, onEditar, onEliminar }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden hover:border-indigo-300 transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-bold text-gray-900">
                  {new Date(registro.fecha_actividad).toLocaleDateString('es-CL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Registrado el {new Date(registro.fecha_registro).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-bold flex items-center gap-2">
              ⏱️ {registro.duracion_horas}h
            </span>
            {registro.validado_por_empresa && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                ✓ Validado
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">📝 DESCRIPCIÓN DE ACTIVIDADES</p>
            <p className={`text-gray-900 ${!expanded && 'line-clamp-2'}`}>
              {registro.descripcion_actividad}
            </p>
          </div>

          {expanded && (
            <>
              {registro.equipos_utilizados && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">🔧 EQUIPOS UTILIZADOS</p>
                  <p className="text-gray-900">{registro.equipos_utilizados}</p>
                </div>
              )}

              {registro.herramientas_utilizadas && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">🛠️ HERRAMIENTAS</p>
                  <p className="text-gray-900">{registro.herramientas_utilizadas}</p>
                </div>
              )}

              {registro.normas_seguridad_aplicadas && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">⚠️ NORMAS DE SEGURIDAD</p>
                  <p className="text-gray-900">{registro.normas_seguridad_aplicadas}</p>
                </div>
              )}

              {registro.observaciones && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">💭 OBSERVACIONES</p>
                  <p className="text-gray-900">{registro.observaciones}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
          >
            {expanded ? '▲ Ver menos' : '▼ Ver más'}
          </button>
          <button
            onClick={onEditar}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition text-sm"
          >
            ✏️ Editar
          </button>
          <button
            onClick={onEliminar}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}


// ============ FORMULARIO DE BITÁCORA ============
function FormularioBitacora({ practica, registroEdit, onClose, onGuardar }) {
  // ✅ ESTADO CORREGIDO con los nombres correctos de campos
  const [formData, setFormData] = useState({
    fecha_actividad: registroEdit?.fecha_actividad?.split('T')[0] || new Date().toISOString().split('T')[0],
    duracion_horas: registroEdit?.duracion_horas || '',  // ✅ CORREGIDO
    descripcion_actividad: registroEdit?.descripcion_actividad || '',  // ✅ CORREGIDO
    equipos_utilizados: registroEdit?.equipos_utilizados || '',  // ✅ NUEVO
    herramientas_utilizadas: registroEdit?.herramientas_utilizadas || '',  // ✅ NUEVO
    normas_seguridad_aplicadas: registroEdit?.normas_seguridad_aplicadas || '',  // ✅ NUEVO
    observaciones: registroEdit?.observaciones || ''
  });
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      if (registroEdit) {
        // Actualizar
        await api.put(
          `/v1/estudiantes/practicas/${practica.id_practica}/bitacora/${registroEdit.id_bitacora}`,
          formData
        );
        alert('✅ Registro actualizado exitosamente');
      } else {
        // Crear nuevo
        await api.post(
          `/v1/estudiantes/practicas/${practica.id_practica}/bitacora`,
          formData
        );
        alert('✅ Registro creado exitosamente');
      }
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">
                {registroEdit ? '✏️ Editar Registro' : '➕ Nuevo Registro'}
              </h3>
              <p className="text-indigo-100">Bitácora de actividades</p>
            </div>
            <button
              onClick={onClose}
              disabled={guardando}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📅 Fecha de Actividad <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha_actividad}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_actividad: e.target.value }))}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ⏱️ Duración (horas) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duracion_horas}
                onChange={(e) => setFormData(prev => ({ ...prev, duracion_horas: e.target.value }))}
                required
                min="0.5"
                max="12"
                step="0.5"
                placeholder="Ej: 8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📝 Descripción de Actividades <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion_actividad}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion_actividad: e.target.value }))}
              required
              rows={4}
              placeholder="Describe detalladamente las actividades que realizaste durante el día..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sé específico: ¿Qué hiciste? ¿Dónde? ¿Con qué propósito?
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔧 Equipos Utilizados
            </label>
            <textarea
              value={formData.equipos_utilizados}
              onChange={(e) => setFormData(prev => ({ ...prev, equipos_utilizados: e.target.value }))}
              rows={2}
              placeholder="Ej: Torno paralelo, fresadora CNC, soldadora MIG..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🛠️ Herramientas Utilizadas
            </label>
            <textarea
              value={formData.herramientas_utilizadas}
              onChange={(e) => setFormData(prev => ({ ...prev, herramientas_utilizadas: e.target.value }))}
              rows={2}
              placeholder="Ej: Cuchillas de corte, llaves Allen, micrómetro..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ⚠️ Normas de Seguridad Aplicadas
            </label>
            <textarea
              value={formData.normas_seguridad_aplicadas}
              onChange={(e) => setFormData(prev => ({ ...prev, normas_seguridad_aplicadas: e.target.value }))}
              rows={2}
              placeholder="Ej: Uso de casco, guantes, protección auditiva, bloqueo de energía..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              💭 Observaciones Adicionales
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              placeholder="Aprendizajes, dificultades, comentarios generales..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Consejo:</strong> Completa todos los campos posibles. Esto facilitará 
              la elaboración de tus informes y será valioso para tu evaluación.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? '⏳ Guardando...' : (registroEdit ? '💾 Actualizar' : '➕ Registrar')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ============ MODALES EXISTENTES ============
function DetallePracticaModal({ practica, onClose, onSubirInforme, onVerBitacora }) {
  const progreso = Math.round((practica.horas_completadas / practica.horas_requeridas) * 100);
  const fechaInicioPractica = practica?.fecha_inicio_practica ? new Date(practica.fecha_inicio_practica) : null;
  let fechaTerminoCalculada = null;
  if (fechaInicioPractica) {
    if (practica?.fecha_termino_practica) {
      fechaTerminoCalculada = new Date(practica.fecha_termino_practica);
    } else {
      fechaTerminoCalculada = new Date(fechaInicioPractica);
      fechaTerminoCalculada.setDate(fechaTerminoCalculada.getDate() + 40);
    }
  }
  const diasTranscurridosRaw = fechaInicioPractica
    ? Math.floor((new Date() - fechaInicioPractica) / (1000 * 60 * 60 * 24))
    : 0;
  const diasTranscurridos = Math.max(0, diasTranscurridosRaw);
  const diasTotales = fechaInicioPractica && fechaTerminoCalculada
    ? Math.floor((fechaTerminoCalculada - fechaInicioPractica) / (1000 * 60 * 60 * 24))
    : 0;
  const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold text-white">
                  ID: {practica.id_practica}
                </span>
                <EstadoPracticaBadge estado={practica.estado_practica} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{practica.titulo_oferta}</h2>
              <p className="text-blue-100 flex items-center gap-2">
                <span>🏢</span> {practica.empresa_nombre}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">📊 Progreso de la Práctica</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-1">{progreso}%</div>
                <p className="text-sm text-gray-600">Completado</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-1">{practica.horas_completadas}</div>
                <p className="text-sm text-gray-600">Horas trabajadas</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-1">{practica.horas_requeridas - practica.horas_completadas}</div>
                <p className="text-sm text-gray-600">Horas restantes</p>
              </div>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${progreso}%` }}
                >
                  <span className="text-xs font-bold text-white">{progreso}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                {practica.horas_completadas} de {practica.horas_requeridas} horas completadas
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-900 mb-4">📋 Información General</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoDetailCard 
                icon="📅" 
                label="Fecha de Inicio" 
                value={new Date(practica.fecha_inicio_practica).toLocaleDateString('es-CL', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })} 
              />
              <InfoDetailCard 
                icon="🎯" 
                label="Fecha de Término" 
                value={fechaTerminoCalculada
                  ? fechaTerminoCalculada.toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '—'} 
              />
              <InfoDetailCard 
                icon="⏰" 
                label="Días Transcurridos" 
                value={`${diasTranscurridos} de ${diasTotales} días`} 
              />
              <InfoDetailCard 
                icon="⏳" 
                label="Días Restantes" 
                value={diasRestantes > 0 ? `${diasRestantes} días` : 'Finalizado'} 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <button 
              onClick={onSubirInforme}
              className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
            >
              📤 Subir Informe
            </button>
            <button 
              onClick={onVerBitacora}
              className="px-6 py-4 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition"
            >
              📔 Ver Bitácora
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubirInformeModal({ idPractica, numeroInforme, onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    numero_informe: numeroInforme || 1,
    titulo_informe: '',
    actividades_realizadas: '',
    aprendizajes_obtenidos: '',
    dificultades_encontradas: '',
    horas_registradas: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      await api.post(`/v1/estudiantes/practicas/${idPractica}/informes`, formData);
      alert('✅ Informe subido exitosamente');
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">📤 Subir Informe</h3>
              <p className="text-emerald-100">Informe #{formData.numero_informe} de seguimiento</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Número de Informe
            </label>
            <select
              value={formData.numero_informe}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_informe: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value={1}>Informe #1 - Primer Avance</option>
              <option value={2}>Informe #2 - Segundo Avance</option>
              <option value={3}>Informe #3 - Informe Final</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Título del Informe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo_informe}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo_informe: e.target.value }))}
              required
              placeholder="Ej: Informe de Avance - Primera Semana"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Actividades Realizadas <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.actividades_realizadas}
              onChange={(e) => setFormData(prev => ({ ...prev, actividades_realizadas: e.target.value }))}
              required
              rows={4}
              placeholder="Describe las actividades que realizaste durante este período..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Aprendizajes Obtenidos <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.aprendizajes_obtenidos}
              onChange={(e) => setFormData(prev => ({ ...prev, aprendizajes_obtenidos: e.target.value }))}
              required
              rows={3}
              placeholder="¿Qué aprendiste durante este período?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Dificultades Encontradas
            </label>
            <textarea
              value={formData.dificultades_encontradas}
              onChange={(e) => setFormData(prev => ({ ...prev, dificultades_encontradas: e.target.value }))}
              rows={3}
              placeholder="¿Tuviste alguna dificultad o desafío?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Horas Registradas <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.horas_registradas}
              onChange={(e) => setFormData(prev => ({ ...prev, horas_registradas: e.target.value }))}
              required
              min="1"
              placeholder="Ej: 40"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📌 Importante:</strong> El informe será enviado a tu profesor guía para su revisión. 
              Asegúrate de que la información sea precisa y completa.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? '⏳ Subiendo...' : '📤 Subir Informe'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ SECCIONES ============
function SeccionInformes({ informes, practicaActual, onSubirInforme }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">📝 Mis Informes</h2>
          <p className="text-gray-600">Gestiona tus informes de práctica (máximo 3)</p>
        </div>
        {practicaActual && (
          <button
            onClick={() => onSubirInforme()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
          >
            ➕ Subir Nuevo Informe
          </button>
        )}
      </div>

      {!practicaActual && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-6">
          <p className="text-amber-800 font-semibold">
            ⚠️ No tienes una práctica activa. Postula a una oferta para comenzar a subir informes.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(numero => {
          const informe = informes.find(i => i.numero_informe === numero);
          return (
            <InformeCard 
              key={numero}
              numero={numero}
              informe={informe}
              onSubir={() => onSubirInforme(numero)}
              deshabilitado={!practicaActual}
            />
          );
        })}
      </div>

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
  );
}

function BuscarOfertas({ ofertas, onPostular, practicaActual }) {
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
      {/* Banner informativo removido para permitir postular aunque exista práctica activa */}

      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">🔍 Buscar Ofertas</h2>
        <p className="text-gray-600">
          {practicaActual ? 'Explora ofertas para tu próxima práctica' : 'Encuentra la práctica perfecta para ti'}
        </p>
      </div>

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
          <div className="flex gap-2 flex-wrap">
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

      <div>
        <p className="text-gray-600 mb-4">{ofertasFiltradas.length} ofertas encontradas</p>
        <div className="grid md:grid-cols-2 gap-6">
          {ofertasFiltradas.map(oferta => (
            <OfertaCardCompleta 
              key={oferta.id_oferta} 
              oferta={oferta}
              onPostular={onPostular}
              practicaActual={practicaActual}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OfertaCardCompleta({ oferta, onPostular, practicaActual }) {
  const tienePracticaActiva = practicaActual !== null; // ya no bloquea UI, solo referencia informativa
  const puedePostular = !oferta.ya_postulado;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{oferta.titulo_oferta}</h3>
          <p className="text-gray-600 flex items-center gap-2">
            <span>🏢</span> {oferta.empresa_nombre}
          </p>
        </div>
        {oferta.ya_postulado && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
            ✓ Postulado
          </span>
        )}
        {/* Sin badge de bloqueo por práctica activa */}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{oferta.descripcion}</p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">
          ⏱️ {oferta.duracion_horas}h
        </span>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold">
          📍 {oferta.modalidad_trabajo}
        </span>
        {oferta.salario_referencial && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">
            💰 ${Number(oferta.salario_referencial).toLocaleString('es-CL')}
          </span>
        )}
      </div>

      {/* Se elimina el mensaje que bloqueaba postulación por práctica activa */}

      <button 
        onClick={() => puedePostular && onPostular(oferta)}
        disabled={!puedePostular}
        className={`w-full px-4 py-3 rounded-xl font-bold transition ${
          !puedePostular
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
        }`}
      >
        {oferta.ya_postulado ? '✓ Ya postulaste' : '📨 Postular'}
      </button>
    </div>
  );
}

function MisPracticas({ practicas, onVerDetalle }) {
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
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-xs text-gray-600">Profesor Guía</p>
                  <p className="font-semibold">{practica.profesor_nombre} {practica.profesor_apellido}</p>
                </div>
              )}

              <button 
                onClick={() => onVerDetalle(practica)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition"
              >
                📋 Ver Detalles Completos
              </button>
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

// ============ COMPONENTES PEQUEÑOS ============
function NavLink({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105' 
          : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
      
      {/* Indicador activo */}
      {active && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
      )}
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

function QuickStatMejorado({ icon, value, label, color }) {
  return (
    <div className="group relative bg-white/20 backdrop-blur-xl rounded-2xl p-5 hover:bg-white/30 transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Efecto de brillo en hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
          <span className="text-4xl font-black text-white drop-shadow-lg">{value}</span>
        </div>
        <p className="text-sm text-white/90 font-bold uppercase tracking-wide">{label}</p>
      </div>
      
      {/* Indicador de hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}


function KPICardMejorado({ titulo, valor, porcentaje, color, icono }) {
  const colorClasses = {
    blue: { 
      bg: 'from-blue-500 to-cyan-500', 
      text: 'text-blue-700', 
      border: 'border-blue-300',
      ring: 'ring-blue-200',
      glow: 'shadow-blue-500/30',
      iconBg: 'bg-blue-500'
    },
    purple: { 
      bg: 'from-purple-500 to-pink-500', 
      text: 'text-purple-700', 
      border: 'border-purple-300',
      ring: 'ring-purple-200',
      glow: 'shadow-purple-500/30',
      iconBg: 'bg-purple-500'
    },
    emerald: { 
      bg: 'from-emerald-500 to-teal-500', 
      text: 'text-emerald-700', 
      border: 'border-emerald-300',
      ring: 'ring-emerald-200',
      glow: 'shadow-emerald-500/30',
      iconBg: 'bg-emerald-500'
    }
  };
  const colors = colorClasses[color];

  return (
    <div className={`group relative bg-white rounded-3xl p-8 border-2 ${colors.border} hover:border-transparent hover:ring-4 ${colors.ring} transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl`}>
      {/* Efecto de gradiente en hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Header con icono */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl ${colors.glow} group-hover:scale-110 transition-all duration-300`}>
            <span className="text-4xl">{icono}</span>
          </div>
          <span className={`text-5xl font-black ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
            {valor}
          </span>
        </div>
        
        {/* Título */}
        <p className="text-base font-bold text-gray-700 mb-4 group-hover:text-gray-900 transition">
          {titulo}
        </p>
        
        {/* Barra de progreso con animación */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-1000 relative overflow-hidden`}
              style={{ width: `${porcentaje}%` }}
            >
              {/* Efecto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <p className={`text-sm font-black ${colors.text} mt-2 text-right`}>
            {porcentaje}% completado
          </p>
        </div>
      </div>
      
      {/* Decoración de esquina */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
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

function InfoDetailCard({ icon, label, value }) {
  return (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs text-gray-600 font-semibold uppercase">{label}</p>
      </div>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function OfertaCardMejorada({ oferta, onPostular }) {
  const puedePostular = !oferta.ya_postulado;
  
  return (
    <div className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Efecto de gradiente en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Ribbon si ya postuló */}
      {oferta.ya_postulado && (
        <div className="absolute top-4 -right-12 rotate-45 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black py-1 px-12 shadow-lg z-10">
          ✓ POSTULADO
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
            <span className="text-3xl">🏢</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-lg text-gray-900 mb-1 group-hover:text-yellow-600 transition line-clamp-1">
              {oferta.titulo_oferta}
            </h4>
            <p className="text-sm text-gray-600 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {oferta.empresa_nombre}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
            <span>⏱️</span> {oferta.duracion_horas}h
          </span>
          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
            <span>📍</span> {oferta.modalidad_trabajo}
          </span>
          {oferta.salario_referencial && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
              <span>💰</span> ${Number(oferta.salario_referencial).toLocaleString('es-CL')}
            </span>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            puedePostular && onPostular(oferta);
          }}
          disabled={!puedePostular}
          className={`w-full px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-lg ${
            !puedePostular
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:scale-105 hover:shadow-xl'
          }`}
        >
          {oferta.ya_postulado ? '✓ Ya postulaste' : '📨 Postular'}
        </button>
      </div>
    </div>
  );
}

function PostulacionCard({ postulacion, onCancelar, cancelando }) {
  const estados = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    aceptada: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
    en_revision: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '👁️' },
    cancelada: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🚫' }
  };
  const config = estados[postulacion.estado_postulacion] || estados.pendiente;
  
  const puedeCancelar = ['pendiente', 'en_revision'].includes(postulacion.estado_postulacion);

  return (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate mb-1">{postulacion.titulo_oferta}</p>
          <p className="text-xs text-gray-600">{postulacion.empresa_nombre}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text} flex items-center gap-1 whitespace-nowrap`}>
          {config.icon}
        </span>
      </div>
      
      {puedeCancelar && (
        <button
          onClick={() => onCancelar(postulacion.id_postulacion, postulacion.titulo_oferta)}
          disabled={cancelando === postulacion.id_postulacion}
          className="w-full mt-2 px-2 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelando === postulacion.id_postulacion ? 'Cancelando...' : '🗑️ Cancelar'}
        </button>
      )}
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
        <span className="text-2xl">{notificacion.tipo_notificacion === 'informe' ? '📝' : notificacion.tipo_notificacion === 'practica' ? '💼' : '📨'}</span>
        <div className="flex-1">
          <p className={`text-sm ${notificacion.leida ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
            {notificacion.mensaje || notificacion.titulo}
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

function InformeCard({ numero, informe, onSubir, deshabilitado }) {
  const estados = {
    aprobado: { 
      bg: 'from-emerald-500 to-teal-500', 
      icon: '✓',
      label: 'Aprobado',
      textColor: 'text-white',
      borderColor: 'border-emerald-500',
      badgeBg: 'bg-emerald-500'
    },
    enviado: { 
      bg: 'from-amber-500 to-orange-500', 
      icon: '⏳',
      label: 'En Revisión',
      textColor: 'text-white',
      borderColor: 'border-amber-500',
      badgeBg: 'bg-amber-500'
    },
    rechazado: { 
      bg: 'from-red-500 to-pink-500', 
      icon: '✗',
      label: 'Rechazado',
      textColor: 'text-white',
      borderColor: 'border-red-500',
      badgeBg: 'bg-red-500'
    },
    sin_subir: { 
      bg: 'from-gray-400 to-gray-500', 
      icon: '📤',
      label: 'Pendiente',
      textColor: 'text-white',
      borderColor: 'border-gray-300',
      badgeBg: 'bg-gray-400'
    }
  };

  const estado = informe ? (estados[informe.estado_informe] || estados.sin_subir) : estados.sin_subir;

  return (
    <div className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border-2 ${estado.borderColor} hover:shadow-2xl transition-all hover:scale-105 cursor-pointer`}>
      {/* Header con gradiente */}
      <div className={`relative bg-gradient-to-r ${estado.bg} p-6 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-12 h-12 ${estado.badgeBg} rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                {numero}
              </span>
              <h3 className={`text-2xl font-black ${estado.textColor}`}>
                Informe #{numero}
              </h3>
            </div>
            <p className={`text-sm ${estado.textColor} opacity-90 font-semibold`}>
              {estado.label}
            </p>
          </div>
          <div className={`text-5xl ${estado.textColor}`}>
            {estado.icon}
          </div>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-6">
        {informe ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 font-bold mb-1">📅 Enviado</p>
                <p className="text-sm font-black text-gray-900">
                  {new Date(informe.fecha_envio).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
              
              {informe.horas_registradas && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-gray-600 font-bold mb-1">⏰ Horas</p>
                  <p className="text-2xl font-black text-blue-600">
                    {informe.horas_registradas}h
                  </p>
                </div>
              )}
            </div>
            
            {informe.comentarios_profesor && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                <p className="text-xs text-purple-700 font-bold mb-2">💬 Comentarios</p>
                <p className="text-sm text-gray-900">{informe.comentarios_profesor}</p>
              </div>
            )}

            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:scale-105">
              📋 Ver Detalles
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📄</span>
            </div>
            <p className="text-gray-600 text-sm mb-6 font-semibold">
              Este informe aún no ha sido subido
            </p>
            <button 
              onClick={onSubir}
              disabled={deshabilitado}
              className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black hover:from-emerald-700 hover:to-teal-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              📤 Subir Informe #{numero}
            </button>
          </div>
        )}
      </div>
      
      {/* Perforación decorativa tipo ticket */}
      <div className="absolute left-0 right-0 top-[160px] flex justify-between px-2">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-100 rounded-full"></div>
        ))}
      </div>
    </div>
  );
}


function InformeHistorialItem({ informe }) {
  const estados = {
    aprobado: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    enviado: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    rechazado: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' }
  };
  const config = estados[informe.estado_informe] || estados.enviado;

  return (
    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-900">Informe #{informe.numero_informe}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} flex items-center gap-1`}>
          {config.icon} {informe.estado_informe}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Enviado:</p>
          <p className="font-semibold">{new Date(informe.fecha_envio).toLocaleDateString('es-CL')}</p>
        </div>
        {informe.horas_registradas && (
          <div>
            <p className="text-gray-600">Horas:</p>
            <p className="font-black text-blue-600 text-lg">{informe.horas_registradas}h</p>
          </div>
        )}
      </div>
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
