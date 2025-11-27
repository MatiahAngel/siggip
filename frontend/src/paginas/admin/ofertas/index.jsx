// 📁 UBICACIÓN: frontend/src/paginas/admin/ofertas/index.jsx
// 🎯 Página principal para gestionar ofertas de práctica - TEMA GRIS PROFESIONAL

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import FormularioOferta from "../../../components/ofertas/FormularioOferta";
import DetalleOferta from '../../../components/ofertas/DetalleOferta';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getOfertas, deleteOferta, getEstadisticas, getOfertaById } from '../../../servicios/api/ofertasService';

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState([]);
  const [filteredOfertas, setFilteredOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [ofertaEliminar, setOfertaEliminar] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [ofertaDetalle, setOfertaDetalle] = useState(null);
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

  const handleEditarOferta = async (oferta) => {
    try {
      const detalle = await getOfertaById(oferta.id_oferta);
      setOfertaEditar(detalle);
      setShowModal(true);
    } catch (err) {
      console.error('Error al cargar oferta para edición:', err);
      alert('No se pudo cargar la información completa de la oferta');
    }
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
      case 'cerrada': return 'bg-gray-100 text-gray-700 border border-gray-200';
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
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-gray-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando ofertas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header gris profesional */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">💼</span>
                Ofertas de Práctica
              </h1>
              <p className="text-gray-300 text-lg">
                Gestiona las oportunidades laborales para estudiantes
              </p>
            </div>
            <button
              onClick={handleNuevaOferta}
              className="group px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Oferta</span>
            </button>
          </div>
        </div>

        {/* Stats con colores sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Total</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_ofertas || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Activas</p>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.ofertas_activas || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Pausadas</p>
              <span className="text-2xl">⏸️</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.ofertas_pausadas || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Cerradas</p>
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-3xl font-bold text-gray-600">{stats.ofertas_cerradas || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Cupos</p>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-gray-700">{stats.total_cupos || 0}</p>
          </div>
        </div>

        {/* Filtros limpios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h2 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar ofertas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔎</span>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="pausada">Pausadas</option>
              <option value="cerrada">Cerradas</option>
            </select>

            <select
              value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white"
            >
              <option value="">Todas las especialidades</option>
              {especialidadesUnicas.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>

            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white"
            >
              <option value="">Todas las modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Tabla limpia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredOfertas.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl mb-4 block">📭</span>
              <p className="text-gray-500 text-lg font-medium">No se encontraron ofertas</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Título / Empresa</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Especialidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Modalidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cupos</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fechas</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Post.</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOfertas.map((oferta) => (
                    <tr 
                      key={oferta.id_oferta} 
                      className="hover:bg-gray-50 transition-colors"
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
                            <p className="text-sm font-semibold text-gray-900">
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
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200">
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
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-700 border border-gray-200">
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
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold border-2 border-gray-200">
                          {oferta.total_postulaciones || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerDetalle(oferta)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Ver detalle"
                          >
                            <span className="text-lg">👁️</span>
                          </button>
                          <button
                            onClick={() => handleEditarOferta(oferta)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="Editar"
                          >
                            <span className="text-lg">✏️</span>
                          </button>
                          <button
                            onClick={() => handleEliminarClick(oferta)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <span className="text-lg">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
                Mostrando <span className="font-semibold">{filteredOfertas.length}</span> de <span className="font-semibold">{ofertas.length}</span> ofertas
              </div>
            </div>
          )}
        </div>
      </div>

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