// 📁 frontend/src/paginas/admin/especialidades/ListaEspecialidades.jsx
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getEspecialidades, deleteEspecialidad } from '../../../servicios/api/especialidadesService';
import FormularioEspecialidad from './FormularioEspecialidad';

export default function ListaEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await getEspecialidades(); // debe devolver columnas reales de la tabla
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al obtener especialidades:', e);
      setEspecialidades([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let list = [...especialidades];

    // filtro por estado (en BD: 'activo' / 'inactivo')
    if (filtroEstado) list = list.filter(e => (e.estado || '').toLowerCase() === filtroEstado);

    // búsqueda por nombre_especialidad o descripción
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.nombre_especialidad || '').toLowerCase().includes(q) ||
        (e.descripcion || '').toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  };

  const handleCreate = () => { setEditTarget(null); setShowModal(true); };
  const handleEdit = (esp) => { setEditTarget(esp); setShowModal(true); };
  const handleSaved = () => { setShowModal(false); fetchData(); };

  const handleDeleteClick = (esp) => { setDeleteTarget(esp); setShowConfirmDelete(true); };
  const setShowConfirmDelete = setShowDeleteModal;

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
    if (st === 'activo') return 'bg-green-100 text-green-800';
    if (st === 'inactivo') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  // 📊 estadísticas (usa 'activo' / 'inactivo')
  const total = especialidades.length;
  const activas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'activo').length;
  const inactivas = especialidades.filter(e => (e.estado || '').toLowerCase() === 'inactivo').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Especialidades</h1>
            <p className="text-gray-600 mt-1">Administra las especialidades registradas</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Especialidad</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar especialidad por nombre o descripción..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Especialidades</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Activas</p>
            <p className="text-2xl font-bold text-green-600">{activas}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Inactivas</p>
            <p className="text-2xl font-bold text-gray-600">{inactivas}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando especialidades...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No se encontraron especialidades</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((esp) => (
                    <tr key={esp.id_especialidad} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {esp.nombre_especialidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {esp.descripcion || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(esp.estado)}`}>
                          {esp.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(esp)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                        <button onClick={() => handleDeleteClick(esp)} className="text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      </div>
    </AdminLayout>
  );
}
