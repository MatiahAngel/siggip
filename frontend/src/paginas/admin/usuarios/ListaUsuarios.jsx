// 📁 UBICACIÓN: frontend/src/paginas/admin/usuarios/ListaUsuarios.jsx
// 🎨 Gestión de Usuarios — ESTILO ALTO CONTRASTE (coherente con Ofertas/Especialidades/Empresas)

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import FormularioUsuario from './FormularioUsuario';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { getUsuarios, deleteUsuario, updateUsuario } from '../../../servicios/api/usuariosService';

export default function ListaUsuarios() {
  // datos
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);

  // carga/errores
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true); // skeleton suave inicial
  const [error, setError] = useState('');

  // filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [showInactivos, setShowInactivos] = useState(false);

  // modales
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactivos]);

  useEffect(() => {
    filterUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // fallback opcional para no dejar vacío
      setUsuarios([
        { id_usuario: 1, nombre: 'Admin', apellido_paterno: 'Sistema', email: 'admin@admin.cl', tipo_usuario: 'administrador', estado: 'activo' },
        { id_usuario: 2, nombre: 'Juan', apellido_paterno: 'Pérez', email: 'juan@alumno.cl', tipo_usuario: 'estudiante', estado: 'activo' },
        { id_usuario: 3, nombre: 'María', apellido_paterno: 'González', email: 'maria@profesor.cl', tipo_usuario: 'profesor', estado: 'inactivo' },
      ]);
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

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setShowModal(true);
  };

  const handleDeleteClick = (usuario) => {
    setDeleteTarget(usuario);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUsuario(deleteTarget.id_usuario); // soft delete esperado desde API
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

  // estilos de rol (badges con borde para consistencia)
  const getRoleBadgeClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'administrador') return 'bg-red-50 text-red-700 border border-red-200';
    if (r === 'directivo') return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (r === 'profesor') return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (r === 'estudiante') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (r === 'empresa') return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-gray-50 text-gray-700 border border-gray-200';
    // nota: mantenemos getRoleIcon para el emoji
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

  // métricas (memo)
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
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">👥</span>
                Usuarios
              </h1>
              <p className="text-blue-100 text-lg">Administra todos los usuarios del sistema</p>
            </div>
            <button
              onClick={handleCreate}
              className="group px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Usuarios</p>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md border border-emerald-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Activos</p>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-bold text-emerald-900">{stats.activos}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Inactivos</p>
              <span className="text-3xl">⏸️</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.inactivos}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md border border-orange-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Empresas</p>
              <span className="text-3xl">🏢</span>
            </div>
            <p className="text-4xl font-bold text-orange-900">{stats.empresas}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Profesores</p>
              <span className="text-3xl">👨‍🏫</span>
            </div>
            <p className="text-4xl font-bold text-purple-900">{stats.profesores}</p>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search */}
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, apellidos o email…"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔎</span>
            </div>

            {/* Role + Mostrar inactivos */}
            <div className="flex items-center gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white cursor-pointer"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactivos}
                  onChange={(e) => setShowInactivos(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ver inactivos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Tabla */}
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
          ) : loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600 font-medium">Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-8xl mb-4 block">📭</span>
              <p className="text-gray-500 text-xl font-medium">No se encontraron usuarios</p>
              <p className="text-gray-400 mt-2">Ajusta los filtros o crea un nuevo usuario</p>
              <button
                onClick={handleCreate}
                className="mt-6 group px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-semibold">Nuevo Usuario</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsuarios.map((usuario) => (
                    <tr
                      key={usuario.id_usuario}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      {/* Usuario */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold">
                              {(usuario.nombre || '?').charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {usuario.nombre} {usuario.apellido_paterno}
                            </div>
                            <div className="text-xs text-gray-500">ID: {usuario.id_usuario}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{usuario.email}</div>
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getRoleBadgeClass(usuario.tipo_usuario)}`}>
                          <span className="mr-1">{getRoleIcon(usuario.tipo_usuario)}</span>
                          {(usuario.tipo_usuario || 'sin rol').toLowerCase()}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${
                            (usuario.estado || '').toLowerCase() === 'activo'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {(usuario.estado || 'inactivo').toLowerCase() === 'activo' ? '✅' : '⏸️'}
                          <span className="ml-1">{(usuario.estado || 'inactivo').toLowerCase()}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <span className="text-xl">✏️</span>
                          </button>

                          {(usuario.estado || '').toLowerCase() === 'inactivo' ? (
                            <button
                              onClick={() => handleRestore(usuario)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Restaurar"
                            >
                              <span className="text-xl">♻️</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(usuario)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Eliminar"
                            >
                              <span className="text-xl">🗑️</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer de tabla con contador */}
              <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
                Mostrando <span className="font-semibold">{filteredUsuarios.length}</span> de{' '}
                <span className="font-semibold">{usuarios.length}</span> usuarios
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 shadow-sm">
            <p className="text-gray-700 font-medium">
              📊 Mostrando <span className="font-bold text-blue-600">{filteredUsuarios.length}</span> de{' '}
              <span className="font-bold text-indigo-600">{usuarios.length}</span> usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
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
    </AdminLayout>
  );
}
