// 📁 frontend/src/componentes/Empresas/ListaEmpresas.jsx
// 🎨 Gestión de Empresas — ESTILO ALTO CONTRASTE (coherente con Ofertas/Especialidades)

import { useState, useEffect, useMemo } from 'react';
import { getEmpresas, deleteEmpresa } from '../../servicios/api/empresasService';
import FormularioEmpresa from './FormularioEmpresa';
import ConfirmModal from '../common/ConfirmModal';
import AdminLayout from '../../components/layout/AdminLayout';

const ListaEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true); // skeleton suave
  const [error, setError] = useState(null);

  // filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // modales
  const [showModal, setShowModal] = useState(false);
  const [empresaEditar, setEmpresaEditar] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [empresaEliminar, setEmpresaEliminar] = useState(null);

  useEffect(() => { fetchEmpresas(); }, []);
  useEffect(() => { filterEmpresas(); }, [searchTerm, filtroEstado, empresas]);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const data = await getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      setError('Error al cargar empresas');
      setEmpresas([]);
    } finally {
      setLoading(false);
      setTimeout(() => setSoftLoading(false), 250);
    }
  };

  const filterEmpresas = () => {
    let list = [...empresas];

    if (filtroEstado) {
      list = list.filter(e => (e.estado_empresa || '').toLowerCase() === filtroEstado);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.razon_social || '').toLowerCase().includes(q) ||
        (e.nombre_comercial || '').toLowerCase().includes(q) ||
        (e.rut_empresa || '').toLowerCase().includes(q) ||
        (e.giro_comercial || '').toLowerCase().includes(q) ||
        (e.contacto_principal || '').toLowerCase().includes(q) ||
        (e.email_contacto || '').toLowerCase().includes(q)
      );
    }
    setFilteredEmpresas(list);
  };

  const handleNuevaEmpresa = () => { setEmpresaEditar(null); setShowModal(true); };
  const handleEditarEmpresa = (empresa) => { setEmpresaEditar(empresa); setShowModal(true); };
  const handleEliminarClick = (empresa) => { setEmpresaEliminar(empresa); setShowConfirmDelete(true); };

  const handleConfirmDelete = async () => {
    try {
      await deleteEmpresa(empresaEliminar.id_empresa);
      setShowConfirmDelete(false);
      setEmpresaEliminar(null);
      fetchEmpresas();
    } catch (err) {
      console.error('Error al eliminar empresa:', err);
      alert('Error al eliminar empresa');
    }
  };

  const handleGuardarExito = () => { setShowModal(false); fetchEmpresas(); };

  const getEstadoBadgeClass = (estado) => {
    const st = (estado || '').toLowerCase();
    if (st === 'activa') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (st === 'inactiva') return 'bg-slate-100 text-slate-700 border border-slate-200';
    if (st === 'suspendida') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  // 📊 métricas
  const { total, activas, inactivas, suspendidas } = useMemo(() => {
    const total = empresas.length;
    const activas = empresas.filter(e => (e.estado_empresa || '').toLowerCase() === 'activa').length;
    const inactivas = empresas.filter(e => (e.estado_empresa || '').toLowerCase() === 'inactiva').length;
    const suspendidas = empresas.filter(e => (e.estado_empresa || '').toLowerCase() === 'suspendida').length;
    return { total, activas, inactivas, suspendidas };
  }, [empresas]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">

        {/* Header con gradiente y CTA (match Ofertas/Especialidades) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">🏢</span>
                Empresas
              </h1>
              <p className="text-blue-100 text-lg">Administra todas las empresas del sistema</p>
            </div>
            <button
              onClick={handleNuevaEmpresa}
              className="group px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Empresa</span>
            </button>
          </div>
        </div>

        {/* Stats (tarjetas con borde/gradiente suave) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-md border border-red-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Suspendidas</p>
              <span className="text-3xl">🚫</span>
            </div>
            <p className="text-4xl font-bold text-red-900">{suspendidas}</p>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por razón social, nombre, RUT, giro, contacto o email…"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔎</span>
            </div>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white cursor-pointer"
            >
              <option value="">📋 Todos los estados</option>
              <option value="activa">✅ Activas</option>
              <option value="inactiva">⏸️ Inactivas</option>
              <option value="suspendida">🚫 Suspendidas</option>
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
              <p className="mt-3 text-gray-600 font-medium">Cargando empresas...</p>
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-8xl mb-4 block">📭</span>
              <p className="text-gray-500 text-xl font-medium">No se encontraron empresas</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
              <button
                onClick={handleNuevaEmpresa}
                className="mt-6 group px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-semibold">Nueva Empresa</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RUT</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Razón Social</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre Comercial</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEmpresas.map((empresa) => (
                    <tr
                      key={empresa.id_empresa}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{empresa.rut_empresa}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{empresa.razon_social}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empresa.nombre_comercial || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="font-medium">{empresa.contacto_principal || '—'}</div>
                        <div className="text-xs text-gray-500">{empresa.email_contacto || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg capitalize ${getEstadoBadgeClass(empresa.estado_empresa)}`}>
                          {(empresa.estado_empresa || '').toLowerCase() === 'activa' && '✅'}
                          {(empresa.estado_empresa || '').toLowerCase() === 'inactiva' && '⏸️'}
                          {(empresa.estado_empresa || '').toLowerCase() === 'suspendida' && '🚫'}
                          <span className="ml-1">{(empresa.estado_empresa || 'inactiva').toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditarEmpresa(empresa)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <span className="text-xl">✏️</span>
                          </button>
                          <button
                            onClick={() => handleEliminarClick(empresa)}
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

              {/* Footer de tabla con contador */}
              <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
                Mostrando <span className="font-semibold">{filteredEmpresas.length}</span> de{' '}
                <span className="font-semibold">{empresas.length}</span> empresas
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo (chip a juego) */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 shadow-sm">
            <p className="text-gray-700 font-medium">
              📊 Mostrando <span className="font-bold text-blue-600">{filteredEmpresas.length}</span> de{' '}
              <span className="font-bold text-indigo-600">{empresas.length}</span> empresas
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModal && (
        <FormularioEmpresa
          empresa={empresaEditar}
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardarExito}
        />
      )}

      {showConfirmDelete && (
        <ConfirmModal
          title="Eliminar Empresa"
          message={`¿Está seguro que desea eliminar la empresa "${empresaEliminar?.razon_social}"? Esta acción cambiará su estado a inactiva.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowConfirmDelete(false);
            setEmpresaEliminar(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default ListaEmpresas;
