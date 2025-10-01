// 📁 UBICACIÓN: frontend/src/paginas/admin/ofertas/index.jsx
// 🎯 Página principal para gestionar ofertas de práctica - VERSIÓN MEJORADA

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import FormularioOferta from "../../../components/ofertas/FormularioOferta";
import DetalleOferta from '../../../components/ofertas/DetalleOferta';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getOfertas, deleteOferta, getEstadisticas } from '../../../servicios/api/ofertasService';

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState([]);
  const [filteredOfertas, setFilteredOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [ofertaEliminar, setOfertaEliminar] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [ofertaDetalle, setOfertaDetalle] = useState(null);

  // Estadísticas
  const [stats, setStats] = useState({
    total_ofertas: 0,
    ofertas_activas: 0,
    ofertas_cerradas: 0,
    ofertas_pausadas: 0,
    total_cupos: 0
  });

  useEffect(() => {
    fetchOfertas();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [busqueda, filtroEstado, filtroEspecialidad, filtroModalidad, ofertas]);

  const fetchOfertas = async () => {
    try {
      setLoading(true);
      const data = await getOfertas();
      setOfertas(data);
      setError('');
    } catch (err) {
      console.error('Error al cargar ofertas:', err);
      setError('Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const data = await getEstadisticas();
      setStats(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...ofertas];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      filtered = filtered.filter(o =>
        o.titulo_oferta.toLowerCase().includes(q) ||
        o.empresa_nombre.toLowerCase().includes(q) ||
        o.nombre_especialidad.toLowerCase().includes(q) ||
        (o.ubicacion || '').toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      filtered = filtered.filter(o => o.estado_oferta === filtroEstado);
    }

    if (filtroEspecialidad) {
      filtered = filtered.filter(o => o.nombre_especialidad === filtroEspecialidad);
    }

    if (filtroModalidad) {
      filtered = filtered.filter(o => o.modalidad_trabajo === filtroModalidad);
    }

    setFilteredOfertas(filtered);
  };

  const handleNuevaOferta = () => {
    setOfertaEditar(null);
    setShowModal(true);
  };

  const handleEditarOferta = (oferta) => {
    setOfertaEditar(oferta);
    setShowModal(true);
  };

  const handleVerDetalle = (oferta) => {
    setOfertaDetalle(oferta);
    setShowDetalle(true);
  };

  const handleEliminarClick = (oferta) => {
    setOfertaEliminar(oferta);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOferta(ofertaEliminar.id_oferta);
      setShowConfirmDelete(false);
      setOfertaEliminar(null);
      fetchOfertas();
      fetchEstadisticas();
    } catch (err) {
      console.error('Error al eliminar oferta:', err);
      alert('Error al eliminar oferta');
    }
  };

  const handleGuardarExito = () => {
    setShowModal(false);
    fetchOfertas();
    fetchEstadisticas();
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'activa': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'pausada': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'cerrada': return 'bg-slate-100 text-slate-700 border border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getModalidadBadgeClass = (modalidad) => {
    switch (modalidad) {
      case 'presencial': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'remoto': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'hibrido': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const especialidadesUnicas = [...new Set(ofertas.map(o => o.nombre_especialidad))];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando ofertas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">💼</span>
                Ofertas de Práctica
              </h1>
              <p className="text-blue-100 text-lg">
                Gestiona las oportunidades laborales para estudiantes
              </p>
            </div>
            <button
              onClick={handleNuevaOferta}
              className="group px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Oferta</span>
            </button>
          </div>
        </div>

        {/* Estadísticas mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Ofertas</p>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-blue-900">{stats.total_ofertas || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Activas</p>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-bold text-emerald-900">{stats.ofertas_activas || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-md border border-amber-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Pausadas</p>
              <span className="text-3xl">⏸️</span>
            </div>
            <p className="text-4xl font-bold text-amber-900">{stats.ofertas_pausadas || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Cerradas</p>
              <span className="text-3xl">🔒</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.ofertas_cerradas || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Total Cupos</p>
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-4xl font-bold text-purple-900">{stats.total_cupos || 0}</p>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar ofertas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔎</span>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white cursor-pointer"
            >
              <option value="">📋 Todos los estados</option>
              <option value="activa">✅ Activas</option>
              <option value="pausada">⏸️ Pausadas</option>
              <option value="cerrada">🔒 Cerradas</option>
            </select>

            <select
              value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white cursor-pointer"
            >
              <option value="">🎓 Todas las especialidades</option>
              {especialidadesUnicas.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>

            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white cursor-pointer"
            >
              <option value="">🏢 Todas las modalidades</option>
              <option value="presencial">🏢 Presencial</option>
              <option value="remoto">💻 Remoto</option>
              <option value="hibrido">🔄 Híbrido</option>
            </select>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Tabla mejorada */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredOfertas.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-8xl mb-4 block">📭</span>
              <p className="text-gray-500 text-xl font-medium">No se encontraron ofertas</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Título / Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Modalidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cupos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Postulaciones
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOfertas.map((oferta, index) => (
                    <tr 
                      key={oferta.id_oferta} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-800 border border-gray-200">
                          {oferta.codigo_oferta}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">💼</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              {oferta.titulo_oferta}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span className="text-xs">🏢</span>
                              {oferta.empresa_nombre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-sm font-medium text-blue-700 border border-blue-100">
                          <span className="mr-1">🎓</span>
                          {oferta.nombre_especialidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg ${getModalidadBadgeClass(oferta.modalidad_trabajo)}`}>
                          {oferta.modalidad_trabajo === 'presencial' && '🏢'}
                          {oferta.modalidad_trabajo === 'remoto' && '💻'}
                          {oferta.modalidad_trabajo === 'hibrido' && '🔄'}
                          <span className="ml-1 capitalize">{oferta.modalidad_trabajo}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 text-sm font-bold text-purple-700 border border-purple-100">
                          <span className="mr-1">🎯</span>
                          {oferta.cupos_disponibles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <p className="flex items-center gap-1 text-gray-700 font-medium">
                            <span>📅</span>
                            {new Date(oferta.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </p>
                          <p className="flex items-center gap-1 text-gray-500">
                            <span>⏰</span>
                            {new Date(oferta.fecha_limite_postulacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getEstadoBadgeClass(oferta.estado_oferta)}`}>
                          {oferta.estado_oferta === 'activa' && '✅'}
                          {oferta.estado_oferta === 'pausada' && '⏸️'}
                          {oferta.estado_oferta === 'cerrada' && '🔒'}
                          <span className="ml-1">{oferta.estado_oferta}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold border-2 border-blue-200">
                          {oferta.total_postulaciones || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerDetalle(oferta)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Ver detalle"
                          >
                            <span className="text-xl">👁️</span>
                          </button>
                          <button
                            onClick={() => handleEditarOferta(oferta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <span className="text-xl">✏️</span>
                          </button>
                          <button
                            onClick={() => handleEliminarClick(oferta)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Eliminar"
                          >
                            <span className="text-xl">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer informativo mejorado */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 shadow-sm">
            <p className="text-gray-700 font-medium">
              📊 Mostrando <span className="font-bold text-blue-600">{filteredOfertas.length}</span> de <span className="font-bold text-indigo-600">{ofertas.length}</span> ofertas
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModal && (
        <FormularioOferta
          oferta={ofertaEditar}
          onClose={() => setShowModal(false)}
          onSuccess={handleGuardarExito}
        />
      )}

      {showDetalle && ofertaDetalle && (
        <DetalleOferta
          idOferta={ofertaDetalle.id_oferta}
          onClose={() => setShowDetalle(false)}
          onEditar={handleEditarOferta}
        />
      )}

      {showConfirmDelete && (
        <ConfirmModal
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Oferta"
          message={`¿Estás seguro de que deseas eliminar la oferta "${ofertaEliminar?.titulo_oferta}"? ${
            ofertaEliminar?.total_postulaciones > 0
              ? 'Esta oferta tiene postulaciones asociadas y solo se cerrará.'
              : 'Esta acción no se puede deshacer.'
          }`}
          confirmText={ofertaEliminar?.total_postulaciones > 0 ? 'Cerrar Oferta' : 'Eliminar'}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </AdminLayout>
  );
}