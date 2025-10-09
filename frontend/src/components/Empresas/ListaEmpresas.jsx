// 📁 frontend/src/componentes/Empresas/ListaEmpresas.jsx
// 🎨 Gestión de Empresas — TEMA GRIS PROFESIONAL

import { useState, useEffect, useMemo } from 'react';
import { getEmpresas, deleteEmpresa } from '../../servicios/api/empresasService';
import FormularioEmpresa from './FormularioEmpresa';
import ConfirmModal from '../common/ConfirmModal';
import AdminLayout from '../../components/layout/AdminLayout';

const ListaEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
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
    if (st === 'inactiva') return 'bg-gray-100 text-gray-700 border border-gray-200';
    if (st === 'suspendida') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

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

        {/* Header gris profesional */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">🏢</span>
                Empresas
              </h1>
              <p className="text-gray-300 text-lg">Administra todas las empresas del sistema</p>
            </div>
            <button
              onClick={handleNuevaEmpresa}
              className="group px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Nueva Empresa</span>
            </button>
          </div>
        </div>

        {/* Stats con colores sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase">Suspendidas</p>
              <span className="text-2xl">🚫</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{suspendidas}</p>
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
                placeholder="Buscar por razón social, RUT, giro, contacto o email..."
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
              <option value="inactiva">Inactivas</option>
              <option value="suspendida">Suspendidas</option>
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
              <p className="mt-3 text-gray-600 font-medium">Cargando empresas...</p>
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl mb-4 block">📭</span>
              <p className="text-gray-500 text-lg font-medium">No se encontraron empresas</p>
              <p className="text-gray-400 mt-2">Intenta ajustando los filtros de búsqueda</p>
              <button
                onClick={handleNuevaEmpresa}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-md"
              >
                <span className="text-xl">➕</span>
                <span className="font-semibold">Nueva Empresa</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">RUT</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Razón Social</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre Comercial</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEmpresas.map((empresa) => (
                    <tr
                      key={empresa.id_empresa}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{empresa.rut_empresa}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{empresa.razon_social}</td>
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
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="Editar"
                          >
                            <span className="text-lg">✏️</span>
                          </button>
                          <button
                            onClick={() => handleEliminarClick(empresa)}
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
                Mostrando <span className="font-semibold">{filteredEmpresas.length}</span> de{' '}
                <span className="font-semibold">{empresas.length}</span> empresas
              </div>
            </div>
          )}
        </div>
      </div>

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