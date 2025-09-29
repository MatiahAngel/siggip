// 📁 UBICACIÓN: frontend/src/componentes/Empresas/FormularioEmpresa.jsx
// Formulario para crear y editar empresas (alineado a la BD real)

import { useState, useEffect } from 'react';
import { createEmpresa, updateEmpresa } from '../../servicios/api/empresasService';

const FormularioEmpresa = ({ empresa, onClose, onGuardar }) => {
  const [formData, setFormData] = useState({
    rut_empresa: '',
    razon_social: '',
    nombre_comercial: '',
    giro_comercial: '',
    sector_economico: '',
    direccion: '',
    comuna: '',
    region: '',
    telefono: '',
    email_contacto: '',
    contacto_principal: '',
    cargo_contacto: '',
    fecha_convenio: '',        // YYYY-MM-DD
    estado_empresa: 'activa',  // solo editable al editar
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const regiones = [
    'Arica y Parinacota','Tarapacá','Antofagasta','Atacama','Coquimbo','Valparaíso','Metropolitana',
    "O'Higgins",'Maule','Ñuble','Biobío','La Araucanía','Los Ríos','Los Lagos','Aysén','Magallanes',
  ];

  useEffect(() => {
    if (empresa) {
      setFormData({
        rut_empresa:        empresa.rut_empresa || '',
        razon_social:       empresa.razon_social || '',
        nombre_comercial:   empresa.nombre_comercial || '',
        giro_comercial:     empresa.giro_comercial || '',
        sector_economico:   empresa.sector_economico || '',
        direccion:          empresa.direccion || '',
        comuna:             empresa.comuna || '',
        region:             empresa.region || '',
        telefono:           empresa.telefono || '',
        email_contacto:     empresa.email_contacto || '',
        contacto_principal: empresa.contacto_principal || '',
        cargo_contacto:     empresa.cargo_contacto || '',
        fecha_convenio:     empresa.fecha_convenio ? String(empresa.fecha_convenio).slice(0,10) : '',
        estado_empresa:     empresa.estado_empresa || 'activa',
      });
    }
  }, [empresa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rut_empresa) {
      newErrors.rut_empresa = 'El RUT es obligatorio';
    } else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(formData.rut_empresa)) {
      newErrors.rut_empresa = 'Formato de RUT inválido (ej: 12345678-9)';
    }

    if (!formData.razon_social) newErrors.razon_social = 'La razón social es obligatoria';

    if (formData.email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = { ...formData };
      // Si está vacío, mandamos null para columns opcionales
      if (!payload.sector_economico) payload.sector_economico = null;
      if (!payload.giro_comercial)   payload.giro_comercial   = null;
      if (!payload.contacto_principal) payload.contacto_principal = null;
      if (!payload.cargo_contacto)     payload.cargo_contacto     = null;
      if (!payload.fecha_convenio)     payload.fecha_convenio     = null;

      if (empresa) {
        await updateEmpresa(empresa.id_empresa, payload);
      } else {
        await createEmpresa(payload);
      }
      onGuardar();
    } catch (err) {
      console.error('Error al guardar empresa:', err);
      const msg = err?.response?.data?.error || 'Error al guardar la empresa';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Información empresa */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT Empresa *</label>
                  <input
                    type="text"
                    name="rut_empresa"
                    value={formData.rut_empresa}
                    onChange={handleChange}
                    placeholder="12345678-9"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.rut_empresa ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.rut_empresa && <p className="text-red-500 text-xs mt-1">{errors.rut_empresa}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    name="razon_social"
                    value={formData.razon_social}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.razon_social ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.razon_social && <p className="text-red-500 text-xs mt-1">{errors.razon_social}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    name="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giro Comercial</label>
                  <input
                    type="text"
                    name="giro_comercial"
                    value={formData.giro_comercial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector Económico</label>
                  <input
                    type="text"
                    name="sector_economico"
                    value={formData.sector_economico}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                  <input
                    type="text"
                    name="comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione región</option>
                    {regiones.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    name="email_contacto"
                    value={formData.email_contacto}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.email_contacto ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email_contacto && <p className="text-red-500 text-xs mt-1">{errors.email_contacto}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Convenio</label>
                  <input
                    type="date"
                    name="fecha_convenio"
                    value={formData.fecha_convenio || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {empresa && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      name="estado_empresa"
                      value={formData.estado_empresa}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                      <option value="suspendida">Suspendida</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto principal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Contacto Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
                  <input
                    type="text"
                    name="contacto_principal"
                    value={formData.contacto_principal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    name="cargo_contacto"
                    value={formData.cargo_contacto}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : empresa ? 'Actualizar' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEmpresa;
