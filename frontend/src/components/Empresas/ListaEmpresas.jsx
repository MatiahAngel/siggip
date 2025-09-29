// 📁 frontend/src/componentes/Empresas/ListaEmpresas.jsx
import { useState, useEffect } from 'react';
import { getEmpresas, deleteEmpresa } from '../../servicios/api/empresasService';
import FormularioEmpresa from './FormularioEmpresa';
import ConfirmModal from '../common/ConfirmModal';
import AdminLayout from '../../components/layout/AdminLayout';

const ListaEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setEmpresas(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar empresas');
      setEmpresas([]);
    } finally {
      setLoading(false);
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
    switch (estado) {
      case 'activa': return 'bg-green-100 text-green-800';
      case 'inactiva': return 'bg-gray-100 text-gray-800';
      case 'suspendida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 📊 métricas para la fila de “stats” (igual que Usuarios)
  const total = empresas.length;
  const activas = empresas.filter(e => e.estado_empresa === 'activa').length;
  const inactivas = empresas.filter(e => e.estado_empresa === 'inactiva').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header (igual estructura que Usuarios) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
            <p className="text-gray-600 mt-1">Administra todas las empresas del sistema</p>
          </div>
          <button
            onClick={handleNuevaEmpresa}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Empresa</span>
          </button>
        </div>

        {/* Caja de filtros (misma caja que en Usuarios) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
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
                placeholder="Buscar por razón social, nombre, RUT o giro..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="inactiva">Inactivas</option>
              <option value="suspendida">Suspendidas</option>
            </select>
          </div>
        </div>

        {/* Fila de stats (para que “calce” visualmente con Usuarios) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Empresas</p>
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

        {/* Tabla (mismo padding/colores que Usuarios) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredEmpresas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No se encontraron empresas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón Social</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Comercial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id_empresa} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{empresa.rut_empresa}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.razon_social}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.nombre_comercial || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{empresa.contacto_principal || '-'}</div>
                        <div className="text-xs text-gray-400">{empresa.email_contacto || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(empresa.estado_empresa)}`}>
                          {empresa.estado_empresa}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditarEmpresa(empresa)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarClick(empresa)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
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
      </div>
    </AdminLayout>
  );
};

export default ListaEmpresas;
