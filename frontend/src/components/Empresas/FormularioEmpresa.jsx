// 📁 frontend/src/componentes/Empresas/FormularioEmpresa.jsx
// 🎨 Formulario de Empresa — TEMA GRIS PROFESIONAL

import { useState, useEffect } from 'react';
import { createEmpresa, updateEmpresa } from '../../servicios/api/empresasService';

// Helpers de RUT (copiados desde FormularioUsuario)
const formatRut = (value) => {
  const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();

  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned;

  const dv = cleaned.slice(-1);
  const numbers = cleaned.slice(0, -1);

  if (numbers.length === 0) return dv;

  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted}-${dv}`;
};

const validateRutDigit = (rut) => {
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();

  if (cleaned.length < 2) return false;

  const dv = cleaned.slice(-1);
  const numbers = cleaned.slice(0, -1);

  if (!/^\d+$/.test(numbers)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const calculatedDv =
    expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);

  return dv === calculatedDv;
};

// Quitar puntos pero mantener el guion en el RUT
const normalizeRutForSubmit = (rut) => {
  if (!rut) return '';
  return rut.replace(/\./g, '');
};

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
    fecha_convenio: '',
    estado_empresa: 'activa',
    crear_usuario: true,
    password_usuario: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
        crear_usuario:      false,
        password_usuario:   '',
      });
    }
  }, [empresa]);

  const getEstadoBadge = (estado) => {
    const st = (estado || '').toLowerCase();
    if (st === 'activa') return 'bg-emerald-600 text-white';
    if (st === 'inactiva') return 'bg-gray-600 text-white';
    if (st === 'suspendida') return 'bg-red-600 text-white';
    return 'bg-gray-600 text-white';
  };
  
  const getEstadoIcon = (estado) => {
    const st = (estado || '').toLowerCase();
    if (st === 'activa') return '✅';
    if (st === 'suspendida') return '🚫';
    return '⏸️';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'rut_empresa') {
      const formatted = formatRut(value);
      setFormData(prev => ({ ...prev, rut_empresa: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rut_empresa) {
      newErrors.rut_empresa = 'El RUT es obligatorio';
    } else if (!validateRutDigit(formData.rut_empresa)) {
      newErrors.rut_empresa = 'RUT inválido';
    }

    if (!formData.razon_social) newErrors.razon_social = 'La razón social es obligatoria';

    if (formData.email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'Email inválido';
    }

    if (!empresa && formData.crear_usuario) {
      if (!formData.email_contacto) newErrors.email_contacto = 'Email es obligatorio para crear usuario';
      if (!formData.contacto_principal) newErrors.contacto_principal = 'Nombre del contacto es obligatorio para crear usuario';
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
      payload.rut_empresa = normalizeRutForSubmit(formData.rut_empresa);

      if (!payload.sector_economico) payload.sector_economico = null;
      if (!payload.giro_comercial) payload.giro_comercial = null;
      if (!payload.contacto_principal) payload.contacto_principal = null;
      if (!payload.cargo_contacto) payload.cargo_contacto = null;
      if (!payload.fecha_convenio) payload.fecha_convenio = null;

      if (empresa) {
        await updateEmpresa(empresa.id_empresa, payload);
      } else {
        await createEmpresa(payload);
      }
      onGuardar?.();
    } catch (err) {
      console.error('Error al guardar empresa:', err);
      const msg = err?.response?.data?.error || 'Error al guardar la empresa';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header gris profesional */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-t-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <span className="text-xl leading-none font-bold">✕</span>
          </button>

          <div className="flex items-start gap-4 pr-12">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl">🏢</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {empresa ? (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getEstadoBadge(formData.estado_empresa)} flex items-center gap-1.5 shadow-md`}>
                    <span>{getEstadoIcon(formData.estado_empresa)}</span>
                    <span className="capitalize">{(formData.estado_empresa || '').toLowerCase()}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                    Nueva Empresa
                  </span>
                )}
                <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                  {formData.rut_empresa?.trim() ? `RUT: ${formData.rut_empresa}` : 'Sin RUT'}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-1 break-words">
                {formData.razon_social?.trim() || (empresa ? 'Editar Empresa' : 'Crear Empresa')}
              </h1>
              <p className="text-gray-300 text-sm flex items-center gap-1.5">
                <span>📅</span>
                <span>Convenio: {formData.fecha_convenio || '—'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏷️</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">RUT</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formData.rut_empresa || '—'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏠</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Comuna</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formData.comuna || '—'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📧</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Email</span>
              </div>
              <p className="font-bold text-gray-900 text-lg truncate">{formData.email_contacto || '—'}</p>
            </div>
          </div>

          {/* Sección: Información de la Empresa */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">📋</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información de la Empresa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 bg-white rounded-lg border ${errors.rut_empresa ? 'border-red-400' : 'border-gray-300'}`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">RUT Empresa *</label>
                <input
                  type="text"
                  name="rut_empresa"
                  value={formData.rut_empresa}
                  onChange={handleChange}
                  placeholder="12345678-9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
                {errors.rut_empresa && <p className="text-red-500 text-xs mt-1">{errors.rut_empresa}</p>}
              </div>

              <div className={`p-4 bg-white rounded-lg border ${errors.razon_social ? 'border-red-400' : 'border-gray-300'}`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Razón Social *</label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
                {errors.razon_social && <p className="text-red-500 text-xs mt-1">{errors.razon_social}</p>}
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Giro Comercial</label>
                <input
                  type="text"
                  name="giro_comercial"
                  value={formData.giro_comercial}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Sector Económico</label>
                <input
                  type="text"
                  name="sector_economico"
                  value={formData.sector_economico}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Comuna</label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Región</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Seleccione región</option>
                  {regiones.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className={`p-4 bg-white rounded-lg border ${errors.email_contacto ? 'border-red-400' : 'border-gray-300'}`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Email de Contacto {!empresa && formData.crear_usuario && '*'}
                </label>
                <input
                  type="email"
                  name="email_contacto"
                  value={formData.email_contacto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
                {errors.email_contacto && <p className="text-red-500 text-xs mt-1">{errors.email_contacto}</p>}
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Fecha de Convenio</label>
                <input
                  type="date"
                  name="fecha_convenio"
                  value={formData.fecha_convenio || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              {empresa && (
                <div className="p-4 bg-white rounded-lg border border-gray-300">
                  <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Estado</label>
                  <select
                    name="estado_empresa"
                    value={formData.estado_empresa}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="suspendida">Suspendida</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Sección: Contacto principal */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">👤</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Datos del Contacto Principal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 bg-white rounded-lg border ${errors.contacto_principal ? 'border-red-400' : 'border-gray-300'}`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Nombre del Contacto {!empresa && formData.crear_usuario && '*'}
                </label>
                <input
                  type="text"
                  name="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
                {errors.contacto_principal && <p className="text-red-500 text-xs mt-1">{errors.contacto_principal}</p>}
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Cargo</label>
                <input
                  type="text"
                  name="cargo_contacto"
                  value={formData.cargo_contacto}
                  onChange={handleChange}
                  placeholder="Ej: Gerente General"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
          </section>

          {/* Crear usuario */}
          {!empresa && (
            <section className="mb-2">
              <div className="flex items-start gap-3 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  name="crear_usuario"
                  checked={formData.crear_usuario}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Crear usuario de acceso para la empresa
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Se creará un usuario con el email de contacto para que la empresa pueda publicar ofertas.
                  </p>

                  {formData.crear_usuario && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                        Contraseña (opcional)
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarPassword ? "text" : "password"}
                          name="password_usuario"
                          value={formData.password_usuario}
                          onChange={handleChange}
                          placeholder="Dejar vacío para usar: Empresa123!"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                        >
                          {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Si no especificas una contraseña, se usará: <code className="bg-gray-200 px-1 rounded">Empresa123!</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </form>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                const formEl = e.currentTarget.closest('div').parentElement.previousElementSibling;
                formEl?.requestSubmit?.();
              }}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{empresa ? 'Actualizar' : 'Crear Empresa'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioEmpresa;