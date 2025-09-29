// 📁 frontend/src/paginas/admin/especialidades/FormularioEspecialidad.jsx
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
    estado: 'activo', // valores reales en tu BD
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre_especialidad?.trim()) {
      errs.nombre_especialidad = 'El nombre de la especialidad es obligatorio';
    }
    // validaciones opcionales de números
    const min = parseInt(form.duracion_practica_min || 0, 10);
    const max = parseInt(form.duracion_practica_max || 0, 10);
    if (form.duracion_practica_min && isNaN(min)) errs.duracion_practica_min = 'Debe ser un número';
    if (form.duracion_practica_max && isNaN(max)) errs.duracion_practica_max = 'Debe ser un número';
    if (!isNaN(min) && !isNaN(max) && min && max && min > max) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {especialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                name="codigo_especialidad"
                value={form.codigo_especialidad}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="MECA, AGRO, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                name="nombre_especialidad"
                value={form.nombre_especialidad}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre_especialidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mecánica Industrial"
              />
              {errors.nombre_especialidad && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre_especialidad}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción breve de la especialidad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración práctica (mín)</label>
              <input
                name="duracion_practica_min"
                value={form.duracion_practica_min}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.duracion_practica_min ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="360"
              />
              {errors.duracion_practica_min && (
                <p className="text-red-500 text-xs mt-1">{errors.duracion_practica_min}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración práctica (máx)</label>
              <input
                name="duracion_practica_max"
                value={form.duracion_practica_max}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.duracion_practica_max ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="540"
              />
              {errors.duracion_practica_max && (
                <p className="text-red-500 text-xs mt-1">{errors.duracion_practica_max}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector económico</label>
              <input
                name="sector_economico"
                value={form.sector_economico}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Metalmecánico, Agrícola…"
              />
            </div>

            {especialidad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : especialidad ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
