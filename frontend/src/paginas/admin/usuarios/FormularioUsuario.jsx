// 📁 UBICACIÓN: frontend/src/paginas/admin/usuarios/FormularioUsuario.jsx
// 🎨 Formulario de Usuario — ESTILO ALTO CONTRASTE (coherente con Ofertas/Empresas/Especialidades)

import { useState, useEffect } from 'react';
import { createUsuario, updateUsuario } from '../../../servicios/api/usuariosService';
import { getEspecialidades } from '../../../servicios/api/especialidadesService';

export default function FormularioUsuario({ usuario, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    rut: '',
    telefono: '',
    tipo_usuario: 'estudiante',
    password: '',
    id_especialidad: '',
    ano_ingreso: new Date().getFullYear(),
    titulo_profesional: '',
    anos_experiencia: '',
    codigo_profesor: '',
    cargo: '',
    estado: 'activo',          // estado general del usuario
    estado_laboral: 'activo',  // estado del profesor (estado_profesor)
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [espReady, setEspReady] = useState(false);

  // ==== CARGA ESPECIALIDADES ====
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const data = await getEspecialidades();
        setEspecialidades(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      } finally {
        setEspReady(true);
      }
    };
    cargarEspecialidades();
  }, []);

  // ==== CARGA DATOS PARA EDICIÓN ====
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        apellido_paterno: usuario.apellido_paterno || '',
        apellido_materno: usuario.apellido_materno || '',
        email: usuario.email || '',
        rut: usuario.rut || '',
        telefono: usuario.telefono || '',
        tipo_usuario: usuario.tipo_usuario || 'estudiante',
        password: '',
        id_especialidad:
          usuario.datosEstudiante?.id_especialidad != null
            ? String(usuario.datosEstudiante.id_especialidad)
            : '',
        ano_ingreso: usuario.datosEstudiante?.ano_ingreso || new Date().getFullYear(),
        titulo_profesional: usuario.datosDocente?.titulo_profesional || '',
        anos_experiencia: usuario.datosDocente?.anos_experiencia ?? '',
        codigo_profesor: usuario.datosDocente?.codigo_profesor || '',
        cargo: usuario.datosDocente?.cargo || '',
        estado: usuario.estado || 'activo',
        estado_laboral: usuario.datosDocente?.estado_profesor || 'activo',
      });
    }
  }, [usuario]);

  // ==== VALIDACIONES ====
  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'El apellido es requerido';

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(formData.rut)) {
      newErrors.rut = 'Formato inválido (ej: 12345678-9)';
    }

    if (!usuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.tipo_usuario === 'estudiante' && espReady && !formData.id_especialidad) {
      newErrors.id_especialidad = 'La especialidad es requerida para estudiantes';
    }
    if (formData.tipo_usuario === 'profesor' && espReady && !formData.id_especialidad) {
      newErrors.id_especialidad = 'La especialidad es requerida para profesores';
    }

    // Años de experiencia (numérico y ≥ 0)
    if (formData.tipo_usuario === 'profesor' && formData.anos_experiencia !== '') {
      const n = Number(formData.anos_experiencia);
      if (Number.isNaN(n) || n < 0) newErrors.anos_experiencia = 'Debe ser un número válido (≥ 0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==== SUBMIT ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const dataToSend = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        email: formData.email,
        rut: formData.rut,
        telefono: formData.telefono,
        tipo_usuario: formData.tipo_usuario,
        password: formData.password || undefined,
        estado: formData.estado || 'activo',
      };

      if (formData.tipo_usuario === 'estudiante') {
        dataToSend.id_especialidad = parseInt(formData.id_especialidad, 10);
        dataToSend.ano_ingreso = parseInt(formData.ano_ingreso, 10);
      } else if (formData.tipo_usuario === 'profesor') {
        dataToSend.id_especialidad = parseInt(formData.id_especialidad, 10);
        dataToSend.titulo_profesional = (formData.titulo_profesional || '').trim();
        dataToSend.anos_experiencia = formData.anos_experiencia ? parseInt(formData.anos_experiencia, 10) : 0;
        dataToSend.codigo_profesor = formData.codigo_profesor || '';
        dataToSend.cargo = formData.cargo || 'Profesor';
        dataToSend.estado_laboral = formData.estado_laboral || 'activo';
      }

      if (usuario) {
        await updateUsuario(usuario.id_usuario, dataToSend);
      } else {
        await createUsuario(dataToSend);
      }
      onClose(true);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario: ' + (error?.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ==== HANDLERS ====
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el tipo de usuario, limpiar campos específicos para evitar "arrastrar" datos
    if (name === 'tipo_usuario') {
      const nextType = value;
      setFormData((prev) => ({
        ...prev,
        tipo_usuario: nextType,
        // limpiar estudiante
        id_especialidad: nextType === 'estudiante' || nextType === 'profesor' ? prev.id_especialidad : '',
        ano_ingreso: nextType === 'estudiante' ? prev.ano_ingreso : new Date().getFullYear(),
        // limpiar profesor
        titulo_profesional: nextType === 'profesor' ? prev.titulo_profesional : '',
        anos_experiencia: nextType === 'profesor' ? prev.anos_experiencia : '',
        codigo_profesor: nextType === 'profesor' ? prev.codigo_profesor : '',
        cargo: nextType === 'profesor' ? prev.cargo : '',
        estado_laboral: nextType === 'profesor' ? prev.estado_laboral : 'activo',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'id_especialidad' ? String(value) : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ==== UI ====
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            {usuario ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
          </h2>
          <button
            onClick={() => onClose(false)}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 text-white"
            title="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Aviso de inactivo */}
        {formData.estado === 'inactivo' && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Este usuario está <strong>inactivo</strong>. Cambia <em>Estado</em> a <strong>Activo</strong> para reactivarlo.
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ─────────── Datos generales ─────────── */}
          <section className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">👤</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Datos Generales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Juan"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
              </div>

              {/* Apellido paterno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.apellido_paterno ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Pérez"
                />
                {errors.apellido_paterno && <p className="mt-1 text-xs text-red-600">{errors.apellido_paterno}</p>}
              </div>

              {/* Apellido materno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="González"
                />
              </div>

              {/* RUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rut ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="12345678-9"
                />
                {errors.rut && <p className="mt-1 text-xs text-red-600">{errors.rut}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="usuario@email.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tipo usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario *</label>
                <select
                  name="tipo_usuario"
                  value={formData.tipo_usuario}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="profesor">Profesor</option>
                  <option value="empresa">Empresa</option>
                  <option value="administrador">Administrador</option>
                  <option value="directivo">Directivo</option>
                </select>
              </div>

              {/* Estado usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {!usuario && '*'}
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder={usuario ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
            </div>
          </section>

          {/* ─────────── Datos de Estudiante ─────────── */}
          {formData.tipo_usuario === 'estudiante' && (
            <section className="bg-white rounded-xl border-2 border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">🎓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Datos de Estudiante</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                  <select
                    name="id_especialidad"
                    value={formData.id_especialidad}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.id_especialidad ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">{espReady ? 'Seleccione una especialidad' : 'Cargando...'}</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id_especialidad} value={String(esp.id_especialidad)}>
                        {esp.nombre_especialidad}
                      </option>
                    ))}
                  </select>
                  {errors.id_especialidad && (
                    <p className="mt-1 text-xs text-red-600">{errors.id_especialidad}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año de Ingreso</label>
                  <input
                    type="number"
                    name="ano_ingreso"
                    value={formData.ano_ingreso}
                    onChange={handleChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ─────────── Datos de Profesor ─────────── */}
          {formData.tipo_usuario === 'profesor' && (
            <section className="bg-white rounded-xl border-2 border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">👨‍🏫</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Datos de Profesor</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Especialidad para Profesor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                  <select
                    name="id_especialidad"
                    value={formData.id_especialidad}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.id_especialidad ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">{espReady ? 'Seleccione una especialidad' : 'Cargando...'}</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id_especialidad} value={String(esp.id_especialidad)}>
                        {esp.nombre_especialidad}
                      </option>
                    ))}
                  </select>
                  {errors.id_especialidad && (
                    <p className="mt-1 text-xs text-red-600">{errors.id_especialidad}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título Profesional</label>
                  <input
                    type="text"
                    name="titulo_profesional"
                    value={formData.titulo_profesional}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Ingeniero en Informática"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia</label>
                  <input
                    type="number"
                    name="anos_experiencia"
                    value={formData.anos_experiencia}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.anos_experiencia ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.anos_experiencia && (
                    <p className="mt-1 text-xs text-red-600">{errors.anos_experiencia}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Profesor</label>
                  <input
                    type="text"
                    name="codigo_profesor"
                    value={formData.codigo_profesor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      formData.id_especialidad
                        ? 'Dejar vacío para autogenerar (prefijo por especialidad)'
                        : 'Seleccione una especialidad primero'
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Si lo dejas vacío, se generará automáticamente un código con el prefijo de la especialidad
                    (por ejemplo, Agropecuaria → PROFEAGRO001, Mecánica Industrial → PROFEMECA001).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Profesor Jefe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Laboral</label>
                  <select
                    name="estado_laboral"
                    value={formData.estado_laboral}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* ─────────── Botones ─────────── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"/>
                  </svg>
                  Guardando...
                </>
              ) : (
                usuario ? 'Actualizar' : 'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
