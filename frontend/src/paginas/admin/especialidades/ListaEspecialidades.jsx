// 📁 frontend/src/paginas/admin/especialidades/ListaEspecialidades.jsx
// 🎨 Gestión de Especialidades — ESTILO ALTO CONTRASTE (a juego con Ofertas)

import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getEspecialidades, deleteEspecialidad } from '../../../servicios/api/especialidadesService';
import FormularioEspecialidad from './FormularioEspecialidad';

export default function ListaEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(''); // 'activo' | 'inactivo' | ''

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterData(); }, [searchTerm, filtroEstado, especialidades]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEspecialidades();
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al obtener especialidades:', e);
      setEspecialidades([]);
    } finally {
      setLoading(false);
      setTimeout(() => setSoftLoading(false), 250);
    }
  };

  const filterData = () => {
    let list = [...especialidades];

    if (filtroEstado) list = list.filter(e => (e.estado || '').toLowerCase() === filtroEstado);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.nombre_especialidad || '').toLowerCase().includes(q) ||
        (e.descripcion || '').toLowerCase().includes(q) ||
        (e.codigo_especialidad || '').toLowerCase().includes(q) ||
        (e.sector_economico || '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  };

  const handleCreate = () => { setEditTarget(null); setShowModal(true); };
  const handleEdit = (esp) => { setEditTarget(esp); setShowModal(true); };
  const handleSaved = () => { setShowModal(false); fetchData(); };

  const handleDeleteClick = (esp) => { setDeleteTarget(esp); setShowDeleteModal(true); };
  const handleDeleteConfirm = async () => {
    try {
      await deleteEspecialidad(deleteTarget.id_especialidad);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      console.error('Error al eliminar especialidad:', e);
      alert('Error al eliminar especialidad');
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const st = (estado || '').toLowerCase();
    if (st === 'activo') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (st === 'inactivo') return 'bg-slate-100 text-slate-700 border border-slate-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  // 📊 estadísticas
  const { total, activas, inactivas } = useMemo(() => {
    const total = especialidades.length;
    const activas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'activo').length;
    const inactivas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'inactivo').length;
    return { total, activas, inactivas };
  }, [especialidades]);

  if (loading && !softLoading) {
    // (por si quisieras un loading intermedio independiente del skeleton)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header con gradiente (igual patrón que Ofertas) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">🎓</span>
                Especialidades
              </h1>
              <p className="text-blue-100 text-lg">
                Gestiona las especialidades disponibles para las prácticas
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="group px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Especialidad</span>
            </button>
          </div>
        </div>

        {/* Estadísticas estilo tarjetas (a juego con Ofertas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total</p>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-blue-900">{total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Activas</p>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-bold text-emerald-900">{activas}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Inactivas</p>
              <span className="text-3xl">⏸️</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{inactivas}</p>
          </div>
        </div>

        {/* Filtros mejorados (con título e ícono) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre, sector o descripción..."
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
              <option value="activo">✅ Activas</option>
              <option value="inactivo">⏸️ Inactivas</option>
            </select>
          </div>
        </div>

        {/* Tabla mejorada (header en gradiente, filas con hover) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {softLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-8xl mb-4 block">📭</span>
              <p className="text-gray-500 text-xl font-medium">No se encontraron especialidades</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
              <button
                onClick={handleCreate}
                className="mt-6 group px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-semibold">Nueva Especialidad</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duración</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sector</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((esp) => (
                    <tr
                      key={esp.id_especialidad}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      {/* Código */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-800 border border-gray-200">
                          {esp.codigo_especialidad || '—'}
                        </span>
                      </td>

                      {/* Nombre + ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">🎓</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              {esp.nombre_especialidad}
                            </p>
                            <p className="text-xs text-gray-500">ID: {esp.id_especialidad}</p>
                          </div>
                        </div>
                      </td>

                      {/* Duración (mín–máx) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 text-sm font-medium text-purple-700 border border-purple-100">
                          <span className="mr-1">⏱️</span>
                          {esp.duracion_practica_min || esp.duracion_practica_max
                            ? `${esp.duracion_practica_min || '—'}–${esp.duracion_practica_max || '—'} h`
                            : '—'}
                        </span>
                      </td>

                      {/* Sector económico */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-sm font-medium text-blue-700 border border-blue-100">
                          <span className="mr-1">🏭</span>
                          {esp.sector_economico || '—'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getEstadoBadgeClass(esp.estado)}`}>
                          {(esp.estado || '').toLowerCase() === 'activo' && '✅'}
                          {(esp.estado || '').toLowerCase() === 'inactivo' && '⏸️'}
                          <span className="ml-1">{(esp.estado || 'inactivo').toLowerCase()}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(esp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <span className="text-xl">✏️</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(esp)}
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

        {/* Footer informativo (match Ofertas) */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 shadow-sm">
            <p className="text-gray-700 font-medium">
              📊 Mostrando <span className="font-bold text-blue-600">{filtered.length}</span> de{' '}
              <span className="font-bold text-indigo-600">{especialidades.length}</span> especialidades
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModal && (
        <FormularioEspecialidad
          especialidad={editTarget}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar Especialidad"
          message={`¿Está seguro de eliminar la especialidad "${deleteTarget?.nombre_especialidad}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </AdminLayout>
  );
}
