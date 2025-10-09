// 📁 frontend/src/paginas/admin/especialidades/ListaEspecialidades.jsx
// 🎨 Gestión de Especialidades — TEMA GRIS PROFESIONAL

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
  const [filtroEstado, setFiltroEstado] = useState('');
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
    if (st === 'inactivo') return 'bg-gray-100 text-gray-700 border border-gray-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const { total, activas, inactivas } = useMemo(() => {
    const total = especialidades.length;
    const activas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'activo').length;
    const inactivas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'inactivo').length;
    return { total, activas, inactivas };
  }, [especialidades]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header gris profesional */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">🎓</span>
                Especialidades
              </h1>
              <p className="text-gray-300 text-lg">
                Gestiona las especialidades disponibles para las prácticas
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="group px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Especialidad</span>
            </button>
          </div>
        </div>

        {/* Stats con colores sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Total</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Activas</p>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{activas}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Inactivas</p>
              <span className="text-2xl">⏸️</span>
            </div>
            <p className="text-3xl font-bold text-gray-600">{inactivas}</p>
          </div>
        </div>

        {/* Filtros limpios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h2 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre, sector o descripción..."
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
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Tabla limpia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              <span className="text-7xl mb-4 block">📭</span>
              <p className="text-gray-500 text-lg font-medium">No se encontraron especialidades</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
              <button
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-md"
              >
                <span className="text-xl">➕</span>
                <span className="font-semibold">Nueva Especialidad</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Duración</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Sector</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((esp) => (
                    <tr
                      key={esp.id_especialidad}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-800 border border-gray-200">
                          {esp.codigo_especialidad || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">🎓</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {esp.nombre_especialidad}
                            </p>
                            <p className="text-xs text-gray-500">ID: {esp.id_especialidad}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200">
                          <span className="mr-1">⏱️</span>
                          {esp.duracion_practica_min || esp.duracion_practica_max
                            ? `${esp.duracion_practica_min || '—'}–${esp.duracion_practica_max || '—'} h`
                            : '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200">
                          <span className="mr-1">🏭</span>
                          {esp.sector_economico || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getEstadoBadgeClass(esp.estado)}`}>
                          {(esp.estado || '').toLowerCase() === 'activo' && '✅'}
                          {(esp.estado || '').toLowerCase() === 'inactivo' && '⏸️'}
                          <span className="ml-1">{(esp.estado || 'inactivo').toLowerCase()}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(esp)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="Editar"
                          >
                            <span className="text-lg">✏️</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(esp)}
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
                Mostrando <span className="font-semibold">{filtered.length}</span> de{' '}
                <span className="font-semibold">{especialidades.length}</span> especialidades
              </div>
            </div>
          )}
        </div>
      </div>

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