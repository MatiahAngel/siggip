// 📁 UBICACIÓN: frontend/src/components/ofertas/FormularioOferta.jsx
// 🎯 Formulario para crear y editar ofertas de práctica — TEMA GRIS PROFESIONAL

import { useState, useEffect } from 'react';
import { createOferta, updateOferta, getEmpresas, getEspecialidades } from '../../servicios/api/ofertasService';
import { getMiEmpresa } from '../../servicios/api/empresasService';
import { useAuth } from '../../context/AuthContext';

export default function FormularioOferta({ oferta, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id_empresa: '',
    id_especialidad: '',
    titulo_oferta: '',
    descripcion: '',
    requisitos: '',
    duracion_horas: '',
    horario_trabajo: '',
    ubicacion: '',
  // 🔒 En esta versión, la modalidad está restringida a 'presencial'
  modalidad_trabajo: 'presencial',
    cupos_disponibles: 1,
    fecha_inicio: '',
    fecha_limite_postulacion: '',
    salario_referencial: '',
    beneficios: '',
    estado_oferta: 'activa'
  });

  const [empresas, setEmpresas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [miEmpresa, setMiEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [softLoading, setSoftLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // === Helpers visuales ===
  const getEstadoBadge = (estado) => {
    const badges = {
      activa: 'bg-emerald-500 text-white',
      pausada: 'bg-amber-500 text-white',
      cerrada: 'bg-slate-500 text-white'
    };
    return badges[estado] || badges.cerrada;
  };

  const getEstadoIcon = (estado) => {
    const icons = { activa: '✅', pausada: '⏸️', cerrada: '🔒' };
    return icons[estado] || '📋';
  };

  const getModalidadIcon = (modalidad) => {
    const icons = { presencial: '🏢', remoto: '💻', hibrido: '🔄' };
    return icons[modalidad] || '🏢';
  };

  // === Carga inicial ===
  useEffect(() => {
    const init = async () => {
      await fetchData();
      if (oferta) {
        setFormData({
          id_empresa: oferta.id_empresa || '',
          id_especialidad: oferta.id_especialidad || '',
          titulo_oferta: oferta.titulo_oferta || '',
          descripcion: oferta.descripcion || '',
          requisitos: oferta.requisitos || '',
          duracion_horas: oferta.duracion_horas || '',
          horario_trabajo: oferta.horario_trabajo || '',
          ubicacion: oferta.ubicacion || '',
          modalidad_trabajo: oferta.modalidad_trabajo || 'presencial',
          cupos_disponibles: oferta.cupos_disponibles || 1,
          fecha_inicio: oferta.fecha_inicio?.split('T')[0] || '',
          fecha_limite_postulacion: oferta.fecha_limite_postulacion?.split('T')[0] || '',
          salario_referencial: oferta.salario_referencial || '',
          beneficios: oferta.beneficios || '',
          estado_oferta: oferta.estado_oferta || 'activa'
        });
      } else {
        // Si estamos creando desde el dashboard de empresa, preseleccionar su empresa y fijarla
        try {
          const miEmp = await getMiEmpresa();
          if (miEmp?.id_empresa) {
            setMiEmpresa(miEmp);
            setFormData((prev) => ({ ...prev, id_empresa: miEmp.id_empresa }));
          }
        } catch (e) {
          // Silencioso: si falla, el usuario podrá escoger manualmente
          console.debug('No se pudo preseleccionar empresa:', e?.response?.data || e?.message);
        }
      }
      setSoftLoading(false);
    };
    init();
  }, [oferta?.id_oferta]);

  const fetchData = async () => {
    try {
      const [empresasData, especialidadesData] = await Promise.all([getEmpresas(), getEspecialidades()]);
      setEmpresas(empresasData || []);
      setEspecialidades(especialidadesData || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar empresas y especialidades');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['duracion_horas', 'cupos_disponibles', 'salario_referencial'];
    const val = numericFields.includes(name) ? (value === '' ? '' : Math.max(0, Number(value))) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if ((name === 'fecha_inicio' || name === 'fecha_limite_postulacion') && (formData.fecha_inicio || formData.fecha_limite_postulacion)) {
      validateForm({ ...formData, [name]: val });
    }
  };

  const validateForm = (data = formData) => {
    const newErrors = {};
    const required = {
      id_empresa: 'Selecciona una empresa',
      id_especialidad: 'Selecciona una especialidad',
      titulo_oferta: 'Ingresa un título',
      descripcion: 'Describe la práctica',
      duracion_horas: 'Indica la duración en horas',
      cupos_disponibles: 'Indica los cupos disponibles',
      modalidad_trabajo: 'Selecciona la modalidad',
      fecha_limite_postulacion: 'Selecciona la fecha límite de postulación',
      fecha_inicio: 'Selecciona la fecha de inicio'
    };
    Object.entries(required).forEach(([k, msg]) => {
      if (data[k] === '' || data[k] === null || data[k] === undefined) newErrors[k] = msg;
    });

    if (data.fecha_limite_postulacion && data.fecha_inicio) {
      const fechaLimite = new Date(data.fecha_limite_postulacion);
      const fechaInicio = new Date(data.fecha_inicio);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaLimite >= fechaInicio) {
        newErrors.fecha_limite_postulacion = 'La fecha límite debe ser anterior a la fecha de inicio';
      }
      if (fechaLimite < hoy) {
        newErrors.fecha_limite_postulacion = 'La fecha límite no puede ser en el pasado';
      }
      if (fechaInicio < hoy) {
        newErrors.fecha_inicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    if (data.duracion_horas && Number(data.duracion_horas) === 0) {
      newErrors.duracion_horas = 'La duración debe ser mayor a 0';
    }
    if (data.cupos_disponibles && Number(data.cupos_disponibles) < 1) {
      newErrors.cupos_disponibles = 'Debe haber al menos 1 cupo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (oferta) {
        await updateOferta(oferta.id_oferta, formData);
      } else {
        await createOferta(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error al guardar oferta:', err);
      let errorMsg = 'Error al guardar oferta';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.code === '23514') {
        errorMsg = 'Las fechas ingresadas no son válidas. Verifique que la fecha límite sea anterior a la fecha de inicio.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (softLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded w-40 ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col">
        {/* Header Gris Profesional */}
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
              <span className="text-3xl">{getModalidadIcon(formData.modalidad_trabajo)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {oferta ? (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getEstadoBadge(formData.estado_oferta)} flex items-center gap-1.5 shadow-md`}>
                    <span>{getEstadoIcon(formData.estado_oferta)}</span>
                    <span className="capitalize">{formData.estado_oferta}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                    Nueva Oferta
                  </span>
                )}

                <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md capitalize">
                  {getModalidadIcon(formData.modalidad_trabajo)} {formData.modalidad_trabajo}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-1 break-words">
                {formData.titulo_oferta || (oferta ? 'Editar Oferta' : 'Crear Oferta')}
              </h1>
              <p className="text-gray-300 flex items-center gap-1.5 text-sm">
                <span>🏢</span>
                <span className="truncate">
                  {miEmpresa?.nombre_comercial
                    || empresas.find((e) => String(e.id_empresa) === String(formData.id_empresa))?.nombre_comercial
                    || empresas.find((e) => String(e.id_empresa) === String(formData.id_empresa))?.razon_social
                    || 'Selecciona empresa'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
            <div className="mb-6 bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-sm">
              {error}
            </div>
          )}

          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Cupos</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formData.cupos_disponibles || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Duración</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formData.duracion_horas ? `${formData.duracion_horas}h` : '—'}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Salario ref.</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{formData.salario_referencial ? `$${Number(formData.salario_referencial).toLocaleString('es-CL')}` : 'No especificado'}</p>
            </div>
          </div>

          {/* Sección: Información principal */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">📋</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información principal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 bg-white rounded-lg border ${errors.id_empresa ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Empresa <span className="text-red-500">*</span>
                </label>
                {oferta ? (
                  <select
                    name="id_empresa"
                    value={formData.id_empresa}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Seleccione empresa</option>
                    {empresas.map(emp => (
                      <option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre_comercial || emp.razon_social}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-semibold">
                    {miEmpresa?.nombre_comercial
                      || empresas.find((e) => String(e.id_empresa) === String(formData.id_empresa))?.nombre_comercial
                      || empresas.find((e) => String(e.id_empresa) === String(formData.id_empresa))?.razon_social
                      || 'Empresa no disponible'}
                  </div>
                )}
                {errors.id_empresa && <p className="text-red-500 text-xs mt-2">{errors.id_empresa}</p>}
              </div>

              <div className={`p-4 bg-white rounded-lg border ${errors.id_especialidad ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Especialidad <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_especialidad"
                  value={formData.id_especialidad}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Seleccione especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre_especialidad}</option>
                  ))}
                </select>
                {errors.id_especialidad && <p className="text-red-500 text-xs mt-2">{errors.id_especialidad}</p>}
              </div>

              <div className={`md:col-span-2 p-4 bg-white rounded-lg border ${errors.titulo_oferta ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Título de la Oferta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titulo_oferta"
                  value={formData.titulo_oferta}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="Ej: Práctica Profesional en Mecánica Industrial"
                />
                {errors.titulo_oferta && <p className="text-red-500 text-xs mt-2">{errors.titulo_oferta}</p>}
              </div>
            </div>
          </section>

          {/* Sección: Descripción y Requisitos */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">📝</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Descripción y requisitos</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className={`p-4 bg-white rounded-lg border ${errors.descripcion ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="Describe las actividades y responsabilidades..."
                />
                {errors.descripcion && <p className="text-red-500 text-xs mt-2">{errors.descripcion}</p>}
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Requisitos</label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="Requisitos para postular..."
                />
              </div>
            </div>
          </section>

          {/* Sección: Detalles operativos */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">⚙️</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detalles de la práctica</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.duracion_horas ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Duración (horas) *</p>
                  <input
                    type="number"
                    name="duracion_horas"
                    value={formData.duracion_horas}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                  {errors.duracion_horas && <p className="text-red-500 text-xs mt-1">{errors.duracion_horas}</p>}
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.cupos_disponibles ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Cupos Disponibles *</p>
                  <input
                    type="number"
                    name="cupos_disponibles"
                    value={formData.cupos_disponibles}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                  {errors.cupos_disponibles && <p className="text-red-500 text-xs mt-1">{errors.cupos_disponibles}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🕐</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Horario de Trabajo</p>
                  <input
                    type="text"
                    name="horario_trabajo"
                    value={formData.horario_trabajo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Ej: Lunes a Viernes 9:00-18:00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Ubicación</p>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Dirección o ciudad"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{getModalidadIcon(formData.modalidad_trabajo)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Modalidad *</p>
                  <select
                    name="modalidad_trabajo"
                    value={formData.modalidad_trabajo}
                    // 🔒 Restringido a "Presencial"; dejamos el select con una sola opción para claridad
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 capitalize"
                  >
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Salario Referencial (opcional)</p>
                  <input
                    type="number"
                    name="salario_referencial"
                    value={formData.salario_referencial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.fecha_limite_postulacion ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Fecha Límite Postulación *</p>
                  <input
                    type="date"
                    name="fecha_limite_postulacion"
                    value={formData.fecha_limite_postulacion}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                  {errors.fecha_limite_postulacion && <p className="text-red-500 text-xs mt-1">{errors.fecha_limite_postulacion}</p>}
                  <p className="text-xs text-gray-500 mt-1">Fecha hasta la cual los estudiantes pueden postular</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.fecha_inicio ? 'border-red-400' : 'border-gray-300'} shadow-sm`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Fecha de Inicio *</p>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                  {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
                  <p className="text-xs text-gray-500 mt-1">Fecha en que comienza la práctica</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Beneficios y Estado */}
          <section className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">🎁</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Beneficios y estado</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm md:col-span-2">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Beneficios</label>
                <textarea
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="Beneficios adicionales de la práctica..."
                />
              </div>

              {oferta && (
                <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                  <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Estado</label>
                  <select
                    name="estado_oferta"
                    value={formData.estado_oferta}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
              )}
            </div>
          </section>
        </form>

        {/* Footer fijo (acciones) */}
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
              form="__noop__"
              onClick={(e) => {
                const form = e.currentTarget.closest('div').parentElement.previousElementSibling;
                form?.requestSubmit?.();
              }}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{oferta ? 'Actualizar' : 'Crear'} Oferta</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}