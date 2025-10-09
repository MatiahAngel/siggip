// 📁 frontend/src/paginas/admin/especialidades/FormularioEspecialidad.jsx
// 🎨 Formulario de Especialidad — TEMA GRIS PROFESIONAL

import { useEffect, useState } from 'react';
import { createEspecialidad, updateEspecialidad } from '../../../servicios/api/especialidadesService';

export default function FormularioEspecialidad({ especialidad, onClose, onSaved }) {
  const [form, setForm] = useState({
    codigo_especialidad: '',
    nombre_especialidad: '',
    descripcion: '',
    duracion_practica_min: '',
    duracion_practica_max: '',
    sector_economico: '',
    estado: 'activo',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const getEstadoBadge = (estado) => {
    const st = (estado || '').toLowerCase();
    if (st === 'activo') return 'bg-emerald-600 text-white';
    if (st === 'inactivo') return 'bg-gray-600 text-white';
    return 'bg-gray-600 text-white';
  };
  
  const getEstadoIcon = (estado) => ((estado || '').toLowerCase() === 'activo' ? '✅' : '⏸️');

  useEffect(() => {
    if (especialidad) {
      setForm({
        codigo_especialidad: especialidad.codigo_especialidad ?? '',
        nombre_especialidad: especialidad.nombre_especialidad ?? '',
        descripcion: especialidad.descripcion ?? '',
        duracion_practica_min: especialidad.duracion_practica_min ?? '',
        duracion_practica_max: especialidad.duracion_practica_max ?? '',
        sector_economico: especialidad.sector_economico ?? '',
        estado: especialidad.estado ?? 'activo',
      });
    }
  }, [especialidad]);

  const normalizeNumber = (v) => (v === '' ? '' : Math.max(0, Number(v)));

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numeric = ['duracion_practica_min', 'duracion_practica_max'];
    const val = numeric.includes(name) ? normalizeNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'duracion_practica_min' || name === 'duracion_practica_max') {
      validate({ ...form, [name]: val });
    }
  };

  const validate = (data = form) => {
    const errs = {};
    if (!data.nombre_especialidad?.trim()) {
      errs.nombre_especialidad = 'El nombre de la especialidad es obligatorio';
    }

    const min = Number(data.duracion_practica_min);
    const max = Number(data.duracion_practica_max);
    if (data.duracion_practica_min !== '' && Number.isNaN(min)) errs.duracion_practica_min = 'Debe ser un número';
    if (data.duracion_practica_max !== '' && Number.isNaN(max)) errs.duracion_practica_max = 'Debe ser un número';

    if (
      data.duracion_practica_min !== '' &&
      data.duracion_practica_max !== '' &&
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      min > max
    ) {
      errs.duracion_practica_max = 'El máximo debe ser ≥ al mínimo';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (especialidad) {
        await updateEspecialidad(especialidad.id_especialidad, form);
      } else {
        await createEspecialidad(form);
      }
      onSaved?.();
    } catch (err) {
      console.error('Error al guardar especialidad:', err);
      alert(err?.response?.data?.error || 'Error al guardar especialidad');
    } finally {
      setSaving(false);
    }
  };

  const rangoTexto = (() => {
    const min = form.duracion_practica_min === '' ? null : Number(form.duracion_practica_min);
    const max = form.duracion_practica_max === '' ? null : Number(form.duracion_practica_max);
    if (min && max) return `${min}–${max} h`;
    if (min && !max) return `≥ ${min} h`;
    if (!min && max) return `≤ ${max} h`;
    return '—';
  })();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
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
              <span className="text-3xl">🎓</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {especialidad ? (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getEstadoBadge(form.estado)} flex items-center gap-1.5 shadow-md`}>
                    <span>{getEstadoIcon(form.estado)}</span>
                    <span className="capitalize">{(form.estado || '').toLowerCase()}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                    Nueva Especialidad
                  </span>
                )}
                <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                  {form.codigo_especialidad?.trim() ? `Código: ${form.codigo_especialidad}` : 'Sin código'}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-1 break-words">
                {form.nombre_especialidad?.trim() || (especialidad ? 'Editar Especialidad' : 'Crear Especialidad')}
              </h1>
              <p className="text-gray-300 text-sm flex items-center gap-1.5">
                <span>⏱️</span>
                <span>Rango de práctica: {rangoTexto}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏷️</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Código</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{form.codigo_especialidad || '—'}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Duración mín.</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {form.duracion_practica_min !== '' ? `${form.duracion_practica_min} h` : '—'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🕐</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Duración máx.</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {form.duracion_practica_max !== '' ? `${form.duracion_practica_max} h` : '—'}
              </p>
            </div>
          </div>

          {/* Sección Información principal */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">📋</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información principal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Código</label>
                <input
                  name="codigo_especialidad"
                  value={form.codigo_especialidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                  placeholder="MECA, AGRO, etc."
                />
              </div>

              <div className={`p-4 bg-white rounded-lg border ${errors.nombre_especialidad ? 'border-red-400' : 'border-gray-300'}`}>
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre_especialidad"
                  value={form.nombre_especialidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                  placeholder="Mecánica Industrial"
                />
                {errors.nombre_especialidad && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre_especialidad}</p>
                )}
              </div>

              <div className="md:col-span-2 p-4 bg-white rounded-lg border border-gray-300">
                <label className="block text-xs text-gray-600 font-semibold uppercase mb-2">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                  placeholder="Descripción breve de la especialidad"
                />
              </div>
            </div>
          </section>

          {/* Sección Detalles */}
          <section className="mb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">⚙️</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detalles de práctica</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.duracion_practica_min ? 'border-red-400' : 'border-gray-300'}`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Duración práctica (mín)</p>
                  <input
                    type="number"
                    name="duracion_practica_min"
                    value={form.duracion_practica_min}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                    placeholder="360"
                  />
                  {errors.duracion_practica_min && (
                    <p className="text-red-500 text-xs mt-1">{errors.duracion_practica_min}</p>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border ${errors.duracion_practica_max ? 'border-red-400' : 'border-gray-300'}`}>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🕐</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Duración práctica (máx)</p>
                  <input
                    type="number"
                    name="duracion_practica_max"
                    value={form.duracion_practica_max}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                    placeholder="540"
                  />
                  {errors.duracion_practica_max && (
                    <p className="text-red-500 text-xs mt-1">{errors.duracion_practica_max}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 md:col-span-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏭</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Sector económico</p>
                  <input
                    name="sector_economico"
                    value={form.sector_economico}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                    placeholder="Metalmecánico, Agrícola..."
                  />
                </div>
              </div>

              {especialidad && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{getEstadoIcon(form.estado)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Estado</p>
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={(e) => {
                const formEl = e.currentTarget.closest('div').parentElement.previousElementSibling;
                formEl?.requestSubmit?.();
              }}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{especialidad ? 'Actualizar' : 'Crear'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}