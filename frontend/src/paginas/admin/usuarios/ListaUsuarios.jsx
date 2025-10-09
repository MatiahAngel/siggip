// 📁 UBICACIÓN: frontend/src/paginas/admin/usuarios/ListaUsuarios.jsx
// 🎨 Gestión de Usuarios — TEMA GRIS PROFESIONAL CON ACENTOS

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import FormularioUsuario from './FormularioUsuario';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getUsuarios, getUsuario, deleteUsuario, updateUsuario } from '../../../servicios/api/usuariosService';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true);
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [showInactivos, setShowInactivos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const roles = [
    { value: 'todos', label: 'Todos los roles' },
    { value: 'estudiante', label: 'Estudiantes' },
    { value: 'profesor', label: 'Profesores' },
    { value: 'empresa', label: 'Empresas' },
    { value: 'administrador', label: 'Administradores' },
    { value: 'directivo', label: 'Directivos' },
  ];

  useEffect(() => {
    fetchUsuarios();
  }, [showInactivos]);

  useEffect(() => {
    filterUsuarios();
  }, [searchTerm, filterRole, usuarios]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const data = showInactivos ? await getUsuarios({ estado: 'todos' }) : await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
      setTimeout(() => setSoftLoading(false), 250);
    }
  };

  const filterUsuarios = () => {
    let filtered = [...usuarios];

    if (filterRole !== 'todos') {
      filtered = filtered.filter((u) => (u.tipo_usuario || '').toLowerCase() === filterRole);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.nombre || '').toLowerCase().includes(q) ||
          (u.apellido_paterno || '').toLowerCase().includes(q) ||
          (u.apellido_materno || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q)
      );
    }

    setFilteredUsuarios(filtered);
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setShowModal(true);
  };

  const handleEdit = async (usuario) => {
    try {
      setLoadingUsuario(true);
      const usuarioCompleto = await getUsuario(usuario.id_usuario);
      setSelectedUsuario(usuarioCompleto);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      alert('Error al cargar los datos del usuario');
    } finally {
      setLoadingUsuario(false);
    }
  };

  const handleDeleteClick = (usuario) => {
    setDeleteTarget(usuario);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUsuario(deleteTarget.id_usuario);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handleRestore = async (usuario) => {
    try {
      await updateUsuario(usuario.id_usuario, { estado: 'activo' });
      await fetchUsuarios();
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      alert('No se pudo reactivar el usuario');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setSelectedUsuario(null);
    if (shouldRefresh) fetchUsuarios();
  };

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'administrador') return 'bg-red-50 text-red-700 border border-red-200';
    if (r === 'directivo') return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (r === 'profesor') return 'bg-slate-100 text-slate-700 border border-slate-300';
    if (r === 'estudiante') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (r === 'empresa') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getRoleIcon = (role) => {
    const icons = {
      administrador: '👨‍💼',
      directivo: '👔',
      profesor: '👨‍🏫',
      estudiante: '🎓',
      empresa: '🏢',
    };
    return icons[(role || '').toLowerCase()] || '👤';
  };

  const stats = useMemo(() => {
    const total = usuarios.length;
    const porRol = (rol) => usuarios.filter((u) => (u.tipo_usuario || '').toLowerCase() === rol).length;
    const activos = usuarios.filter((u) => (u.estado || '').toLowerCase() === 'activo').length;
    const inactivos = usuarios.filter((u) => (u.estado || '').toLowerCase() === 'inactivo').length;
    return {
      total,
      estudiantes: porRol('estudiante'),
      profesores: porRol('profesor'),
      empresas: porRol('empresa'),
      administradores: porRol('administrador'),
      directivos: porRol('directivo'),
      activos,
      inactivos,
    };
  }, [usuarios]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header gris profesional */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">👥</span>
                Usuarios
              </h1>
              <p className="text-gray-300 text-lg">Administra todos los usuarios del sistema</p>
            </div>
            <button
              onClick={handleCreate}
              className="group px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nuevo Usuario</span>
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
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Activos</p>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.activos}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Inactivos</p>
              <span className="text-2xl">⏸️</span>
            </div>
            <p className="text-3xl font-bold text-gray-600">{stats.inactivos}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Empresas</p>
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.empresas}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Profesores</p>
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <p className="text-3xl font-bold text-slate-600">{stats.profesores}</p>
          </div>
        </div>

        {/* Filtros limpios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h2 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, apellidos o email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔎</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showInactivos}
                  onChange={(e) => setShowInactivos(e.target.checked)}
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700 font-medium">Ver inactivos</span>
              </label>
            </div>
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
          {softLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ) : loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
              <p className="mt-3 text-gray-600 font-medium">Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl mb-4 block">📭</span>
              <p className="text-gray-500 text-lg font-medium">No se encontraron usuarios</p>
              <p className="text-gray-400 mt-2">Ajusta los filtros o crea un nuevo usuario</p>
              <button
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-md"
              >
                <span className="text-xl">➕</span>
                <span className="font-semibold">Nuevo Usuario</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsuarios.map((usuario) => (
                    <tr
                      key={usuario.id_usuario}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold">
                              {(usuario.nombre || '?').charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {usuario.nombre} {usuario.apellido_paterno}
                            </div>
                            <div className="text-xs text-gray-500">ID: {usuario.id_usuario}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{usuario.email}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getRoleBadgeClass(usuario.tipo_usuario)}`}>
                          <span className="mr-1">{getRoleIcon(usuario.tipo_usuario)}</span>
                          {(usuario.tipo_usuario || 'sin rol').toLowerCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${
                            (usuario.estado || '').toLowerCase() === 'activo'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {(usuario.estado || 'inactivo').toLowerCase() === 'activo' ? '✅' : '⏸️'}
                          <span className="ml-1">{(usuario.estado || 'inactivo').toLowerCase()}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            disabled={loadingUsuario}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                            title="Editar"
                          >
                            <span className="text-lg">✏️</span>
                          </button>

                          {(usuario.estado || '').toLowerCase() === 'inactivo' ? (
                            <button
                              onClick={() => handleRestore(usuario)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Restaurar"
                            >
                              <span className="text-lg">♻️</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(usuario)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <span className="text-lg">🗑️</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
                Mostrando <span className="font-semibold">{filteredUsuarios.length}</span> de{' '}
                <span className="font-semibold">{usuarios.length}</span> usuarios
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <FormularioUsuario
          usuario={selectedUsuario}
          onClose={handleModalClose}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar Usuario"
          message={`¿Estás seguro de eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido_paterno}?`}
          confirmText="Eliminar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}

      {loadingUsuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            <p className="text-gray-700 font-medium">Cargando datos del usuario...</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}