// 📁 UBICACIÓN: frontend/src/components/evaluacion/ModalEvaluacionFinal.jsx
// 🎯 PROPÓSITO: Modal wizard de evaluación final - se adapta según especialidad
// ✅ VERSIÓN FINAL CON PROGRESO REAL Y BOTÓN FINALIZAR

import { useState, useEffect } from 'react';
import {
  getEstructuraEvaluacion,
  verificarEvaluacionFinal,
  crearEvaluacionFinal,
  getEvaluacionFinal,
  actualizarEvaluacionFinal,
  getPlanPractica,
  finalizarEvaluacionFinal  // ✅ AGREGADO
} from '../../servicios/api/empresasService';

// ✅ FUNCIÓN DE CÁLCULO DE PROGRESO REAL
const calcularProgresoEvaluacion = (evaluacionesAreas, evaluacionesTareas, evaluacionesEmpleabilidad, maestroGuia, especialidad) => {
  let puntosCompletados = 0;
  let puntosTotal = 0;

  // 1. Áreas técnicas (40%)
  const areasRequeridas = especialidad?.codigo === 'MECA' ? 5 : 3;
  const areasCalificadas = evaluacionesAreas.filter(a => 
    a.calificacion && a.calificacion >= 1.0 && a.calificacion <= 7.0
  ).length;
  puntosCompletados += areasCalificadas;
  puntosTotal += areasRequeridas;

  // 2. Empleabilidad (40%)
  const empleabilidadCalificada = evaluacionesEmpleabilidad.filter(e => 
    e.nivel_logro && e.nivel_logro.length > 0
  ).length;
  puntosCompletados += empleabilidadCalificada;
  puntosTotal += 9;

  // 3. Tareas opcionales (10%)
  const tareasEvaluadas = evaluacionesTareas.filter(t => 
    t.fue_realizada && t.nivel_logro
  ).length;
  if (tareasEvaluadas > 0) {
    puntosCompletados += Math.min(tareasEvaluadas / 10, 1);
    puntosTotal += 1;
  }

  // 4. Maestro guía (10%)
  if (maestroGuia.nombre?.trim() && maestroGuia.cargo?.trim()) {
    puntosCompletados += 1;
  }
  puntosTotal += 1;

  const porcentaje = puntosTotal > 0 
    ? Math.round((puntosCompletados / puntosTotal) * 100) 
    : 0;
  
  return {
    porcentaje,
    puntosCompletados,
    puntosTotal,
    detalles: {
      areas: `${areasCalificadas}/${areasRequeridas}`,
      empleabilidad: `${empleabilidadCalificada}/9`,
      tareas: tareasEvaluadas,
      maestro_guia: !!(maestroGuia.nombre?.trim() && maestroGuia.cargo?.trim())
    }
  };
};

export default function ModalEvaluacionFinal({ practicante, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [estructura, setEstructura] = useState(null);
  const [evaluacionExistente, setEvaluacionExistente] = useState(null);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);

  // ✅ AGREGADO: Estados para progreso real
  const [progresoReal, setProgresoReal] = useState(0);
  const [progresoDetalles, setProgresoDetalles] = useState({});

  // Estado del formulario
  const [evaluacionesAreas, setEvaluacionesAreas] = useState([]);
  const [evaluacionesTareas, setEvaluacionesTareas] = useState([]);
  const [evaluacionesEmpleabilidad, setEvaluacionesEmpleabilidad] = useState([]);
  const [maestroGuia, setMaestroGuia] = useState({
    nombre: '',
    rut: '',
    cargo: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ AGREGADO: useEffect para calcular progreso automáticamente
  useEffect(() => {
    if (estructura) {
      const progreso = calcularProgresoEvaluacion(
        evaluacionesAreas,
        evaluacionesTareas,
        evaluacionesEmpleabilidad,
        maestroGuia,
        estructura.especialidad
      );
      setProgresoReal(progreso.porcentaje);
      setProgresoDetalles(progreso.detalles);
    }
  }, [evaluacionesAreas, evaluacionesTareas, evaluacionesEmpleabilidad, maestroGuia, estructura]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // 1. Cargar estructura según especialidad
      const est = await getEstructuraEvaluacion(practicante.id_practica);
      setEstructura(est);

      // 2. Cargar plan de práctica para pre-llenar
      let planPractica = null;
      try {
        planPractica = await getPlanPractica(practicante.id_practica);
        console.log('📋 Plan de práctica cargado:', planPractica);
      } catch (error) {
        console.warn('⚠️ No se pudo cargar el plan de práctica:', error);
      }

      // 3. Verificar si ya existe evaluación
      const existe = await verificarEvaluacionFinal(practicante.id_practica);
      
      if (existe.existe) {
        // Si existe evaluación, cargar datos existentes
        const evaluacion = await getEvaluacionFinal(practicante.id_practica);
        setEvaluacionExistente(evaluacion);
        
        setEvaluacionesAreas(evaluacion.evaluaciones_areas.map(a => ({
          id_area_competencia: a.id_area_competencia,
          calificacion: a.calificacion,
          comentarios: a.comentarios || ''
        })));

        setEvaluacionesTareas(evaluacion.evaluaciones_tareas.map(t => ({
          id_tarea: t.id_tarea,
          nivel_logro: t.nivel_logro,
          fue_realizada: t.fue_realizada,
          comentarios: t.comentarios || ''
        })));

        setEvaluacionesEmpleabilidad(evaluacion.evaluaciones_empleabilidad.map(e => ({
          id_competencia_empleabilidad: e.id_competencia_empleabilidad,
          nivel_logro: e.nivel_logro,
          observaciones: e.observaciones || ''
        })));
      } else {
        // NO EXISTE EVALUACIÓN: INICIALIZAR CON DATOS DEL PLAN DE PRÁCTICA

        // ÁREAS: Inicializar basándose en las áreas activas del plan
        const areasIniciales = est.areas_competencia.map(a => {
          const areaEnPlan = planPractica?.areas?.find(ap => ap.id_area_competencia === a.id_area_competencia);
          
          return {
            id_area_competencia: a.id_area_competencia,
            calificacion: 4.0,
            comentarios: '',
            _activa_en_plan: areaEnPlan?.activa || false,
            _nombre_area: a.nombre_area
          };
        });
        setEvaluacionesAreas(areasIniciales);

        // TAREAS: Pre-marcar SOLO las tareas que están activas en el plan
        const tareasIniciales = [];
        if (planPractica?.areas) {
          planPractica.areas.forEach(areaPlan => {
            if (areaPlan.tareas && Array.isArray(areaPlan.tareas)) {
              areaPlan.tareas.forEach(tareaPlan => {
                if (tareaPlan.activa) {
                  tareasIniciales.push({
                    id_tarea: tareaPlan.id_tarea_competencia,
                    nivel_logro: tareaPlan.completada ? 'bueno' : 'suficiente',
                    fue_realizada: true,
                    comentarios: '',
                    _completada: tareaPlan.completada || false,
                    _fecha_completado: tareaPlan.fecha_completado || null,
                    _descripcion: tareaPlan.descripcion_tarea
                  });
                }
              });
            }
          });
        }
        
        console.log(`✅ Pre-llenadas ${tareasIniciales.length} tareas desde el plan de práctica`);
        setEvaluacionesTareas(tareasIniciales);

        // EMPLEABILIDAD: Inicializar con valores por defecto
        setEvaluacionesEmpleabilidad(
          est.competencias_empleabilidad.map(c => ({
            id_competencia_empleabilidad: c.id_competencia_empleabilidad,
            nivel_logro: 'bueno',
            observaciones: ''
          }))
        );
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      alert('Error al cargar la estructura de evaluación');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarArea = (id_area, field, value) => {
    setEvaluacionesAreas(prev =>
      prev.map(a => a.id_area_competencia === id_area ? { ...a, [field]: value } : a)
    );
  };

  const handleActualizarTarea = (id_tarea, field, value) => {
    const existe = evaluacionesTareas.find(t => t.id_tarea === id_tarea);
    
    if (existe) {
      setEvaluacionesTareas(prev =>
        prev.map(t => t.id_tarea === id_tarea ? { ...t, [field]: value } : t)
      );
    } else {
      setEvaluacionesTareas(prev => [...prev, {
        id_tarea,
        nivel_logro: 'bueno',
        fue_realizada: true,
        comentarios: '',
        [field]: value
      }]);
    }
  };

  const handleActualizarEmpleabilidad = (id_competencia, field, value) => {
    setEvaluacionesEmpleabilidad(prev =>
      prev.map(e => e.id_competencia_empleabilidad === id_competencia ? { ...e, [field]: value } : e)
    );
  };

  const validarPaso = () => {
    if (paso === 1) {
      const areasIncompletas = evaluacionesAreas.filter(a => 
        !a.calificacion || a.calificacion < 1.0 || a.calificacion > 7.0
      );
      if (areasIncompletas.length > 0) {
        alert('Todas las áreas deben tener una calificación entre 1.0 y 7.0');
        return false;
      }
    }

    if (paso === 3) {
      const empIncompletas = evaluacionesEmpleabilidad.filter(e => !e.nivel_logro);
      if (empIncompletas.length > 0) {
        alert('Todas las competencias de empleabilidad deben ser evaluadas');
        return false;
      }
    }

    if (paso === 4) {
      if (!maestroGuia.nombre.trim()) {
        alert('El nombre del maestro guía es obligatorio');
        return false;
      }
      if (!maestroGuia.cargo.trim()) {
        alert('El cargo del maestro guía es obligatorio');
        return false;
      }
    }

    return true;
  };

  const handleSiguiente = () => {
    if (!validarPaso()) return;
    setPaso(prev => prev + 1);
  };

  const handleAnterior = () => {
    setPaso(prev => prev - 1);
  };

  const handleGuardar = async () => {
    if (!validarPaso()) return;

    const confirmacion = evaluacionExistente
      ? 'Se actualizará la evaluación existente. ¿Continuar?'
      : 'Se guardará la evaluación como borrador. Podrás continuar editándola. ¿Continuar?';

    if (!window.confirm(confirmacion)) return;

    try {
      setGuardando(true);

      const payload = {
        evaluaciones_areas: evaluacionesAreas,
        evaluaciones_tareas: evaluacionesTareas.filter(t => t.fue_realizada),
        evaluaciones_empleabilidad: evaluacionesEmpleabilidad,
        maestro_guia: maestroGuia
      };

      if (evaluacionExistente) {
        await actualizarEvaluacionFinal(practicante.id_practica, payload);
        alert('✅ Evaluación actualizada correctamente como borrador');
      } else {
        await crearEvaluacionFinal(practicante.id_practica, payload);
        alert('✅ Evaluación guardada como borrador');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      alert(error.response?.data?.error || 'Error al guardar la evaluación');
    } finally {
      setGuardando(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Finalizar evaluación
  const handleFinalizar = async () => {
    if (!validarPaso()) return;

    const confirmacion = window.confirm(
      '¿Finalizar evaluación?\n\n' +
      '• La evaluación será enviada al profesor tutor\n' +
      '• No podrás editarla después de finalizar\n\n' +
      '¿Continuar?'
    );

    if (!confirmacion) return;

    try {
      setGuardando(true);
      const respuesta = await finalizarEvaluacionFinal(practicante.id_practica);
      alert(respuesta.mensaje || '✅ Evaluación finalizada exitosamente');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al finalizar:', error);
      alert(error.response?.data?.error || 'Error al finalizar evaluación');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando estructura de evaluación...</p>
        </div>
      </div>
    );
  }

  if (!estructura) return null;

  const totalPasos = 4;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-2xl font-black">
                {evaluacionExistente ? '✏️ Editar' : '📝 Nueva'} Evaluación Final
              </h3>
              <p className="text-white/90">{practicante.estudiante_nombre} • {estructura.especialidad.nombre}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar - ✅ ACTUALIZADO CON PROGRESO REAL */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-semibold text-gray-900">Paso {paso} de {totalPasos}</span>
              <span className="text-xs text-gray-600 ml-3">
                ({progresoDetalles.areas} áreas, {progresoDetalles.empleabilidad} empleabilidad)
              </span>
            </div>
            <span className="text-sm font-bold text-orange-600">{progresoReal}% completado</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-600 to-amber-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progresoReal}%` }}
            />
          </div>
          
          <div className="mt-4 grid grid-cols-4 gap-2">
            <StepIndicator numero={1} titulo="Áreas Técnicas" activo={paso === 1} completado={paso > 1} />
            <StepIndicator numero={2} titulo="Tareas (Opcional)" activo={paso === 2} completado={paso > 2} />
            <StepIndicator numero={3} titulo="Empleabilidad" activo={paso === 3} completado={paso > 3} />
            <StepIndicator numero={4} titulo="Revisar y Firmar" activo={paso === 4} completado={false} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {paso === 1 && (
            <PasoAreasCompetencia 
              areas={estructura.areas_competencia}
              evaluaciones={evaluacionesAreas}
              onActualizar={handleActualizarArea}
              escala={estructura.escalas.areas_tecnicas}
            />
          )}

          {paso === 2 && (
            <PasoTareas 
              areas={estructura.areas_competencia}
              evaluaciones={evaluacionesTareas}
              onActualizar={handleActualizarTarea}
              escala={estructura.escalas.tareas}
              especialidad={estructura.especialidad.nombre}
            />
          )}

          {paso === 3 && (
            <PasoEmpleabilidad 
              competencias={estructura.competencias_empleabilidad}
              evaluaciones={evaluacionesEmpleabilidad}
              onActualizar={handleActualizarEmpleabilidad}
              escala={estructura.escalas.empleabilidad}
            />
          )}

          {paso === 4 && (
            <PasoRevisar 
              estructura={estructura}
              evaluacionesAreas={evaluacionesAreas}
              evaluacionesTareas={evaluacionesTareas}
              evaluacionesEmpleabilidad={evaluacionesEmpleabilidad}
              maestroGuia={maestroGuia}
              onActualizarMaestro={setMaestroGuia}
            />
          )}
        </div>

        {/* Footer - ✅ ACTUALIZADO CON BOTONES NUEVOS */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleAnterior}
            disabled={paso === 1}
            className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          {paso < totalPasos ? (
            <button
              onClick={handleSiguiente}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition"
            >
              Siguiente →
            </button>
          ) : evaluacionExistente?.estado_evaluacion === 'completada' ? (
            <div className="text-sm text-green-600 font-semibold">
              ✅ Evaluación completada. Pendiente certificación profesor.
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '💾 Guardar Borrador'}
              </button>
              <button
                onClick={handleFinalizar}
                disabled={guardando}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition disabled:opacity-50"
              >
                {guardando ? 'Finalizando...' : '🏁 Finalizar y Enviar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============== COMPONENTES AUXILIARES ===============

function StepIndicator({ numero, titulo, activo, completado }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition ${
        completado ? 'bg-emerald-600 text-white' :
        activo ? 'bg-orange-600 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {completado ? '✓' : numero}
      </div>
      <p className={`text-xs font-semibold text-center ${activo ? 'text-orange-600' : 'text-gray-600'}`}>
        {titulo}
      </p>
    </div>
  );
}

function PasoAreasCompetencia({ areas, evaluaciones, onActualizar, escala }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">📊 Evaluación de Áreas Técnicas</h4>
        <p className="text-gray-600">
          Califica cada área de competencia en escala de {escala.min} a {escala.max}
        </p>
      </div>

      {areas.map((area, idx) => {
        const evaluacion = evaluaciones.find(e => e.id_area_competencia === area.id_area_competencia);
        
        return (
          <div key={area.id_area_competencia} className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-black text-white">{area.numero_area}</span>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-gray-900 mb-1">{area.nombre_area}</h5>
                {area.descripcion_area && (
                  <p className="text-sm text-gray-700 mb-2">{area.descripcion_area}</p>
                )}
                {area.objetivo_terminal && (
                  <p className="text-xs text-gray-600 italic">Objetivo: {area.objetivo_terminal}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Calificación (1.0 - 7.0) <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.1"
                    min={escala.min}
                    max={escala.max}
                    value={evaluacion?.calificacion || 4.0}
                    onChange={(e) => onActualizar(area.id_area_competencia, 'calificacion', parseFloat(e.target.value) || 1.0)}
                    className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-lg text-center"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min={escala.min}
                      max={escala.max}
                      step={escala.paso}
                      value={evaluacion?.calificacion || 4.0}
                      onChange={(e) => onActualizar(area.id_area_competencia, 'calificacion', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Insuficiente</span>
                      <span>Suficiente</span>
                      <span>Excelente</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  value={evaluacion?.comentarios || ''}
                  onChange={(e) => onActualizar(area.id_area_competencia, 'comentarios', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Ej: Excelente desempeño, muestra dominio de las técnicas..."
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PasoTareas({ areas, evaluaciones, onActualizar, escala, especialidad }) {
  const [areaExpandida, setAreaExpandida] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">✓ Evaluación de Tareas Específicas</h4>
        <p className="text-gray-600 mb-4">
          Esta sección es <strong>opcional</strong>. Puedes evaluar tareas específicas o saltar al siguiente paso.
        </p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>Nota:</strong> Si no evalúas tareas específicas, solo se considerarán las calificaciones de las áreas técnicas.
          </p>
        </div>
      </div>

      {areas.map(area => (
        <div key={area.id_area_competencia} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setAreaExpandida(areaExpandida === area.id_area_competencia ? null : area.id_area_competencia)}
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{areaExpandida === area.id_area_competencia ? '▼' : '▶'}</span>
              <span className="font-bold text-gray-900">{area.nombre_area}</span>
              <span className="text-sm text-gray-600">({area.tareas?.length || 0} tareas)</span>
            </div>
          </button>

          {areaExpandida === area.id_area_competencia && area.tareas && (
            <div className="p-4 space-y-3">
              {area.tareas.map(tarea => {
                const evaluacion = evaluaciones.find(e => e.id_tarea === tarea.id_tarea);
                
                return (
                  <div key={tarea.id_tarea} className="p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={evaluacion?.fue_realizada !== false}
                        onChange={(e) => onActualizar(tarea.id_tarea, 'fue_realizada', e.target.checked)}
                        className="mt-1 w-5 h-5 text-orange-600"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {tarea.codigo_tarea}: {tarea.descripcion_tarea}
                        </p>
                        
                        {(evaluacion?.fue_realizada !== false) && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            {escala.opciones.map(opcion => (
                              <button
                                key={opcion}
                                onClick={() => onActualizar(tarea.id_tarea, 'nivel_logro', opcion)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                  evaluacion?.nivel_logro === opcion
                                    ? opcion === 'excelente' ? 'bg-emerald-600 text-white' :
                                      opcion === 'bueno' ? 'bg-blue-600 text-white' :
                                      opcion === 'suficiente' ? 'bg-yellow-600 text-white' :
                                      'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {escala.labels[opcion]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PasoEmpleabilidad({ competencias, evaluaciones, onActualizar, escala }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">👤 Competencias de Empleabilidad</h4>
        <p className="text-gray-600">
          Evalúa las competencias transversales del estudiante (comunes para todas las especialidades)
        </p>
      </div>

      <div className="space-y-4">
        {competencias.map((competencia, idx) => {
          const evaluacion = evaluaciones.find(e => e.id_competencia_empleabilidad === competencia.id_competencia_empleabilidad);
          
          return (
            <div key={competencia.id_competencia_empleabilidad} className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-orange-300 transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-white">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-1">{competencia.nombre_competencia}</h5>
                  {competencia.descripcion && (
                    <p className="text-sm text-gray-600">{competencia.descripcion}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {escala.opciones.map(opcion => (
                    <button
                      key={opcion}
                      onClick={() => onActualizar(competencia.id_competencia_empleabilidad, 'nivel_logro', opcion)}
                      className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-bold text-sm transition ${
                        evaluacion?.nivel_logro === opcion
                          ? opcion === 'excelente' ? 'bg-emerald-600 text-white shadow-lg' :
                            opcion === 'bueno' ? 'bg-blue-600 text-white shadow-lg' :
                            opcion === 'suficiente' ? 'bg-yellow-600 text-white shadow-lg' :
                            'bg-red-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {escala.labels[opcion]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={evaluacion?.observaciones || ''}
                  onChange={(e) => onActualizar(competencia.id_competencia_empleabilidad, 'observaciones', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none text-sm"
                  placeholder="Observaciones (opcional)..."
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasoRevisar({ estructura, evaluacionesAreas, evaluacionesTareas, evaluacionesEmpleabilidad, maestroGuia, onActualizarMaestro }) {
  const promedioAreas = evaluacionesAreas.length > 0
    ? (evaluacionesAreas.reduce((sum, a) => sum + parseFloat(a.calificacion), 0) / evaluacionesAreas.length).toFixed(2)
    : '0.00';

  const tareasRealizadas = evaluacionesTareas.filter(t => t.fue_realizada).length;

  const conteoEmpleabilidad = {
    excelente: evaluacionesEmpleabilidad.filter(e => e.nivel_logro === 'excelente').length,
    bueno: evaluacionesEmpleabilidad.filter(e => e.nivel_logro === 'bueno').length,
    suficiente: evaluacionesEmpleabilidad.filter(e => e.nivel_logro === 'suficiente').length,
    insuficiente: evaluacionesEmpleabilidad.filter(e => e.nivel_logro === 'insuficiente').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">📋 Resumen de Evaluación</h4>
        <p className="text-gray-600">Revisa los datos antes de finalizar</p>
      </div>

      {/* Resumen de Áreas */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> Áreas Técnicas
        </h5>
        <div className="space-y-2 mb-4">
          {evaluacionesAreas.map(eva => {
            const area = estructura.areas_competencia.find(a => a.id_area_competencia === eva.id_area_competencia);
            return (
              <div key={eva.id_area_competencia} className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="font-semibold text-gray-900">{area?.nombre_area}</span>
                <span className="text-2xl font-black text-orange-600">{eva.calificacion}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">PROMEDIO FINAL</span>
            <span className="text-3xl font-black text-orange-600">{promedioAreas}</span>
          </div>
        </div>
      </div>

      {/* Resumen de Tareas */}
      {tareasRealizadas > 0 && (
        <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <h5 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>✓</span> Tareas Evaluadas
          </h5>
          <p className="text-gray-700">
            Se evaluaron <strong>{tareasRealizadas}</strong> tareas específicas
          </p>
        </div>
      )}

      {/* Resumen de Empleabilidad */}
      <div className="p-5 bg-purple-50 rounded-2xl border-2 border-purple-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>👤</span> Competencias de Empleabilidad
        </h5>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-emerald-600">{conteoEmpleabilidad.excelente}</p>
            <p className="text-xs text-gray-600">Excelentes</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-blue-600">{conteoEmpleabilidad.bueno}</p>
            <p className="text-xs text-gray-600">Buenas</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-yellow-600">{conteoEmpleabilidad.suficiente}</p>
            <p className="text-xs text-gray-600">Suficientes</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-red-600">{conteoEmpleabilidad.insuficiente}</p>
            <p className="text-xs text-gray-600">Insuficientes</p>
          </div>
        </div>
      </div>

      {/* Datos del Maestro Guía */}
      <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>✍️</span> Datos del Maestro Guía
        </h5>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre Completo <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={maestroGuia.nombre}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, nombre: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: Carlos Martínez González"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              RUT
            </label>
            <input
              type="text"
              value={maestroGuia.rut}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, rut: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: 12.345.678-9"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cargo <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={maestroGuia.cargo}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, cargo: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: Jefe de Taller"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={maestroGuia.email}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: carlos@empresa.cl"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={maestroGuia.telefono}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, telefono: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>
        </div>
      </div>
    </div>
  );
}