// 📁 UBICACIÓN: frontend/src/components/evaluacion/ModalEvaluacionFinal.jsx
// 🎯 VERSIÓN CON NOTIFICACIONES BONITAS
// ✅ Sistema de notificaciones integrado sin CSS externo
// ✅ Modales de confirmación profesionales

import { useState, useEffect } from 'react';
import {
  getEstructuraEvaluacion,
  verificarEvaluacionFinal,
  crearEvaluacionFinal,
  getEvaluacionFinal,
  actualizarEvaluacionFinal,
  getPlanPractica,
  finalizarEvaluacionFinal
} from '../../servicios/api/empresasService';

// ═══════════════════════════════════════════════════════════════
// 🆔 Utilidades de RUT (mismo algoritmo que LoginEstudiante)
// ═══════════════════════════════════════════════════════════════

const formatRut = (value) => {
  const cleaned = String(value || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned;
  const dv = cleaned.slice(-1);
  const numbers = cleaned.slice(0, -1);
  if (numbers.length === 0) return dv;
  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

const validateRutDigit = (rut) => {
  const cleaned = String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length < 2) return false;
  const dv = cleaned.slice(-1);
  const numbers = cleaned.slice(0, -1);
  if (!/^\d+$/.test(numbers)) return false;
  let sum = 0;
  let multiplier = 2;
  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === calculatedDv;
};

const cleanRut = (rut) => String(rut || '').replace(/\./g, '').replace(/-/g, '');

// ═══════════════════════════════════════════════════════════════
// 🎨 COMPONENTES DE NOTIFICACIÓN (SIN CSS EXTERNO)
// ═══════════════════════════════════════════════════════════════

function Notificacion({ tipo, mensaje, onClose }) {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => {
      setSaliendo(true);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const estilos = {
    exito: { bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600', icono: '✅' },
    error: { bg: 'bg-gradient-to-r from-red-500 to-red-600', icono: '❌' },
    advertencia: { bg: 'bg-gradient-to-r from-amber-500 to-amber-600', icono: '⚠️' },
    info: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', icono: 'ℹ️' }
  };

  const estilo = estilos[tipo] || estilos.info;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-md ${estilo.bg} text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20`}
      style={{
        transform: visible && !saliendo ? 'translateX(0)' : 'translateX(400px)',
        opacity: visible && !saliendo ? 1 : 0,
        transition: 'all 0.3s ease-out'
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{estilo.icono}</span>
        <p className="flex-1 font-semibold leading-relaxed">{mensaje}</p>
        <button
          onClick={() => {
            setSaliendo(true);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white transition flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ModalConfirmacion({ titulo, mensaje, onConfirmar, onCancelar, tipo = 'info' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  const estilos = {
    info: { bg: 'from-blue-500 to-blue-600', icono: 'ℹ️', botonBg: 'bg-blue-600 hover:bg-blue-700' },
    advertencia: { bg: 'from-amber-500 to-amber-600', icono: '⚠️', botonBg: 'bg-amber-600 hover:bg-amber-700' },
    peligro: { bg: 'from-red-500 to-red-600', icono: '🚨', botonBg: 'bg-red-600 hover:bg-red-700' },
    exito: { bg: 'from-emerald-500 to-emerald-600', icono: '✅', botonBg: 'bg-emerald-600 hover:bg-emerald-700' }
  };

  const estilo = estilos[tipo] || estilos.info;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease-out'
        }}
        onClick={onCancelar}
      />
      <div
        className="fixed top-1/2 left-1/2 z-[9999] w-full max-w-md px-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
          transition: 'all 0.2s ease-out'
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${estilo.bg} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{estilo.icono}</span>
              <h3 className="text-xl font-black">{titulo}</h3>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{mensaje}</p>
          </div>

          <div className="px-6 pb-6 flex gap-3 justify-end">
            <button
              onClick={onCancelar}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className={`px-6 py-3 ${estilo.botonBg} text-white rounded-xl font-semibold transition`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🧮 CÁLCULO DE PROGRESO
// ═══════════════════════════════════════════════════════════════

const calcularProgresoReal = (areas, tareas, empleabilidad, maestro) => {
  console.group('📊 CALCULANDO PROGRESO');
  
  let puntos = 0;
  const total = 100;

  // 1. Áreas técnicas: 40 puntos
  const areasCompletas = areas.filter(a => {
    const valida = a.calificacion && a.calificacion >= 1.0 && a.calificacion <= 7.0;
    console.log(`  Área ${a.id_area_competencia}: ${a.calificacion} -> ${valida ? '✓' : '✗'}`);
    return valida;
  }).length;
  
  const puntosAreas = areas.length > 0 ? (areasCompletas / areas.length) * 40 : 0;
  puntos += puntosAreas;
  console.log(`  ✅ Áreas: ${areasCompletas}/${areas.length} = ${puntosAreas.toFixed(1)} puntos`);

  // 2. Empleabilidad: 40 puntos
  const empCompletas = empleabilidad.filter(e => {
    const valida = e.nivel_logro && ['excelente', 'bueno', 'suficiente', 'insuficiente'].includes(e.nivel_logro);
    return valida;
  }).length;
  
  const puntosEmp = empleabilidad.length > 0 ? (empCompletas / empleabilidad.length) * 40 : 0;
  puntos += puntosEmp;
  console.log(`  ✅ Empleabilidad: ${empCompletas}/${empleabilidad.length} = ${puntosEmp.toFixed(1)} puntos`);

  // 3. Tareas: 10 puntos (opcional)
  const tareasConNivel = tareas.filter(t => t.fue_realizada && t.nivel_logro).length;
  const puntosTareas = tareasConNivel > 0 ? 10 : 0;
  puntos += puntosTareas;
  console.log(`  ✅ Tareas: ${tareasConNivel} evaluadas = ${puntosTareas} puntos`);

  // 4. Maestro: 10 puntos
  const maestroOk = maestro.nombre?.trim() && maestro.cargo?.trim();
  const puntosMaestro = maestroOk ? 10 : 0;
  puntos += puntosMaestro;
  console.log(`  ✅ Maestro: ${maestroOk ? 'Completo' : 'Incompleto'} = ${puntosMaestro} puntos`);

  const porcentaje = Math.round(puntos);
  console.log(`  🎯 TOTAL: ${porcentaje}% (${puntos.toFixed(1)}/100)`);
  console.groupEnd();

  return {
    porcentaje: Math.min(100, Math.max(0, porcentaje)),
    detalles: {
      areas: `${areasCompletas}/${areas.length}`,
      empleabilidad: `${empCompletas}/${empleabilidad.length}`,
      tareas: tareasConNivel,
      maestro: maestroOk
    }
  };
};

// ═══════════════════════════════════════════════════════════════
// 📝 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ModalEvaluacionFinal({ practicante, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [estructura, setEstructura] = useState(null);
  const [evaluacionExistente, setEvaluacionExistente] = useState(null);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [progresoReal, setProgresoReal] = useState(0);
  const [progresoDetalles, setProgresoDetalles] = useState({});

  // 🔔 Estados de notificaciones
  const [notificacion, setNotificacion] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(null);

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

  // 🔔 Funciones de notificación
  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
  };

  const mostrarConfirmacion = (tipo, titulo, mensaje, onConfirmar) => {
    setModalConfirmacion({
      tipo,
      titulo,
      mensaje,
      onConfirmar,
      onCancelar: () => setModalConfirmacion(null)
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (estructura) {
      const progreso = calcularProgresoReal(
        evaluacionesAreas,
        evaluacionesTareas,
        evaluacionesEmpleabilidad,
        maestroGuia
      );
      setProgresoReal(progreso.porcentaje);
      setProgresoDetalles(progreso.detalles);
    }
  }, [evaluacionesAreas, evaluacionesTareas, evaluacionesEmpleabilidad, maestroGuia, estructura]);

  const cargarDatos = async () => {
    try {
      console.group('🔄 CARGANDO DATOS INICIALES');
      setLoading(true);

      const est = await getEstructuraEvaluacion(practicante.id_practica);
      setEstructura(est);
      console.log('✅ Estructura cargada:', est);

      let planPractica = null;
      try {
        planPractica = await getPlanPractica(practicante.id_practica);
        console.log('✅ Plan de práctica:', planPractica);
      } catch (error) {
        console.warn('⚠️ No hay plan de práctica');
      }

      const existe = await verificarEvaluacionFinal(practicante.id_practica);
      console.log('🔍 Verificación evaluación:', existe);
      
      if (existe.existe && existe.evaluacion) {
        console.log('📝 Cargando evaluación existente...');
        const evaluacion = await getEvaluacionFinal(practicante.id_practica);
        setEvaluacionExistente(evaluacion);
        
        setEvaluacionesAreas(evaluacion.evaluaciones_areas.map(a => ({
          id_area_competencia: a.id_area_competencia,
          calificacion: parseFloat(a.calificacion) || 4.0,
          comentarios: a.comentarios || ''
        })));

        setEvaluacionesTareas(evaluacion.evaluaciones_tareas.map(t => ({
          id_tarea: t.id_tarea,
          nivel_logro: t.nivel_logro || 'bueno',
          fue_realizada: t.fue_realizada !== false,
          comentarios: t.comentarios || ''
        })));

        setEvaluacionesEmpleabilidad(evaluacion.evaluaciones_empleabilidad.map(e => ({
          id_competencia_empleabilidad: e.id_competencia_empleabilidad,
          nivel_logro: e.nivel_logro || 'bueno',
          observaciones: e.observaciones || ''
        })));

        if (planPractica) {
          setMaestroGuia({
            nombre: planPractica.maestro_guia_nombre || '',
            rut: planPractica.maestro_guia_rut || '',
            cargo: planPractica.maestro_guia_cargo || '',
            email: planPractica.maestro_guia_email || '',
            telefono: planPractica.maestro_guia_telefono || ''
          });
        }
        
        console.log('✅ Datos cargados desde evaluación existente');
      } else {
        console.log('🆕 Inicializando nueva evaluación');

        const areasIniciales = est.areas_competencia.map(a => ({
          id_area_competencia: a.id_area_competencia,
          calificacion: 4.0,
          comentarios: ''
        }));
        setEvaluacionesAreas(areasIniciales);

        const tareasIniciales = [];
        if (planPractica?.areas) {
          planPractica.areas.forEach(areaPlan => {
            if (areaPlan.tareas && Array.isArray(areaPlan.tareas)) {
              areaPlan.tareas.forEach(tareaPlan => {
                if (tareaPlan.activa) {
                  tareasIniciales.push({
                    id_tarea: tareaPlan.id_tarea_competencia,
                    nivel_logro: 'bueno',
                    fue_realizada: true,
                    comentarios: ''
                  });
                }
              });
            }
          });
        }
        setEvaluacionesTareas(tareasIniciales);

        setEvaluacionesEmpleabilidad(
          est.competencias_empleabilidad.map(c => ({
            id_competencia_empleabilidad: c.id_competencia_empleabilidad,
            nivel_logro: 'bueno',
            observaciones: ''
          }))
        );

        if (planPractica) {
          setMaestroGuia({
            nombre: planPractica.maestro_guia_nombre || '',
            rut: planPractica.maestro_guia_rut || '',
            cargo: planPractica.maestro_guia_cargo || '',
            email: planPractica.maestro_guia_email || '',
            telefono: planPractica.maestro_guia_telefono || ''
          });
        }
        
        console.log('✅ Datos inicializados para nueva evaluación');
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ ERROR CARGANDO DATOS:', error);
      mostrarNotificacion('error', 'Error al cargar: ' + error.message);
      setTimeout(onClose, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarArea = (id_area, field, value) => {
    console.log(`📝 Actualizando área ${id_area}.${field} = ${value}`);
    setEvaluacionesAreas(prev =>
      prev.map(a => a.id_area_competencia === id_area ? { ...a, [field]: value } : a)
    );
  };

  const handleActualizarTarea = (id_tarea, field, value) => {
    console.log(`📝 Actualizando tarea ${id_tarea}.${field} = ${value}`);
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
    console.log(`📝 Actualizando empleabilidad ${id_competencia}.${field} = ${value}`);
    setEvaluacionesEmpleabilidad(prev =>
      prev.map(e => e.id_competencia_empleabilidad === id_competencia ? { ...e, [field]: value } : e)
    );
  };

  const validarPaso = (pasoActual = paso) => {
    console.log(`🔍 Validando paso ${pasoActual}`);
    
    if (pasoActual === 1) {
      const areasIncompletas = evaluacionesAreas.filter(a => 
        !a.calificacion || a.calificacion < 1.0 || a.calificacion > 7.0
      );
      if (areasIncompletas.length > 0) {
        console.warn(`❌ ${areasIncompletas.length} áreas sin calificar`);
        mostrarNotificacion('advertencia', `Debes calificar todas las áreas técnicas (${areasIncompletas.length} pendientes)`);
        return false;
      }
    }

    if (pasoActual === 3) {
      const empIncompletas = evaluacionesEmpleabilidad.filter(e => !e.nivel_logro);
      if (empIncompletas.length > 0) {
        console.warn(`❌ ${empIncompletas.length} competencias de empleabilidad sin evaluar`);
        mostrarNotificacion('advertencia', `Debes evaluar todas las competencias de empleabilidad (${empIncompletas.length} pendientes)`);
        return false;
      }
    }

    if (pasoActual === 4) {
      if (!maestroGuia.nombre?.trim()) {
        console.warn('❌ Falta nombre del maestro guía');
        mostrarNotificacion('advertencia', 'El nombre del maestro guía es obligatorio');
        return false;
      }
      if (!maestroGuia.cargo?.trim()) {
        console.warn('❌ Falta cargo del maestro guía');
        mostrarNotificacion('advertencia', 'El cargo del maestro guía es obligatorio');
        return false;
      }
      // Validación de RUT si fue ingresado
      if ((maestroGuia.rut || '').trim() && !validateRutDigit(maestroGuia.rut)) {
        console.warn('❌ RUT del maestro guía inválido');
        mostrarNotificacion('advertencia', 'El RUT del maestro guía es inválido');
        return false;
      }
    }

    console.log(`✅ Paso ${pasoActual} validado`);
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
    console.group('💾 ═══ GUARDANDO EVALUACIÓN ═══');
    
    try {
      setGuardando(true);

      const payload = {
        evaluaciones_areas: evaluacionesAreas.map(a => {
          const clean = {
            id_area_competencia: a.id_area_competencia,
            calificacion: parseFloat(a.calificacion) || 4.0,
            comentarios: (a.comentarios || '').trim()
          };
          console.log('  📊 Área:', clean);
          return clean;
        }),
        evaluaciones_tareas: evaluacionesTareas
          .filter(t => t.fue_realizada)
          .map(t => {
            const clean = {
              id_tarea: t.id_tarea,
              nivel_logro: t.nivel_logro,
              fue_realizada: true,
              comentarios: (t.comentarios || '').trim()
            };
            console.log('  ✓ Tarea:', clean);
            return clean;
          }),
        evaluaciones_empleabilidad: evaluacionesEmpleabilidad.map(e => {
          const clean = {
            id_competencia_empleabilidad: e.id_competencia_empleabilidad,
            nivel_logro: e.nivel_logro,
            observaciones: (e.observaciones || '').trim()
          };
          console.log('  👤 Empleabilidad:', clean);
          return clean;
        }),
        maestro_guia: {
          nombre: (maestroGuia.nombre || '').trim(),
          rut: cleanRut((maestroGuia.rut || '').trim()),
          cargo: (maestroGuia.cargo || '').trim(),
          email: (maestroGuia.email || '').trim(),
          telefono: (maestroGuia.telefono || '').trim()
        }
      };

      console.log('📤 PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));

      let resultado;
      if (evaluacionExistente) {
        console.log('🔄 Actualizando evaluación existente...');
        resultado = await actualizarEvaluacionFinal(practicante.id_practica, payload);
        console.log('✅ Resultado actualización:', resultado);
        mostrarNotificacion('exito', 'Evaluación actualizada correctamente como borrador');
      } else {
        console.log('🆕 Creando nueva evaluación...');
        resultado = await crearEvaluacionFinal(practicante.id_practica, payload);
        console.log('✅ Resultado creación:', resultado);
        mostrarNotificacion('exito', 'Evaluación guardada como borrador');
        
        setEvaluacionExistente({ 
          estado_evaluacion: 'en_proceso',
          id_evaluacion: resultado.id_evaluacion 
        });
      }

      if (onSuccess) {
        console.log('🔄 Llamando onSuccess...');
        onSuccess();
      }
      
      console.log('🎉 GUARDADO EXITOSO');
      console.groupEnd();
      return true;
      
    } catch (error) {
      console.error('❌ ERROR AL GUARDAR:', error);
      console.error('Detalles:', error.response?.data);
      mostrarNotificacion('error', 'Error al guardar: ' + (error.response?.data?.error || error.message));
      console.groupEnd();
      return false;
    } finally {
      setGuardando(false);
    }
  };

const handleFinalizar = async () => {
  console.group('🏁 ═══ FINALIZANDO EVALUACIÓN ═══');
  
  // Validar TODOS los pasos
  console.log('🔍 Validando todos los pasos...');
  for (let i = 1; i <= 4; i++) {
    if (!validarPaso(i)) {
      console.warn(`❌ Falló validación del paso ${i}`);
      setPaso(i);
      console.groupEnd();
      return;
    }
  }
  console.log('✅ Todos los pasos validados');

  // Modal de confirmación bonito
  mostrarConfirmacion(
    'advertencia',
    '⚠️ ¿Finalizar evaluación?',
    '• La evaluación será enviada al profesor tutor\n• NO podrás editarla después de finalizar\n• Asegúrate de haber revisado todos los datos\n\n¿Deseas continuar?',
    async () => {
      setModalConfirmacion(null);
      
      try {
        setGuardando(true);

        // Si no existe evaluación, guardarla PRIMERO
        if (!evaluacionExistente) {
          console.log('💾 No existe evaluación, guardando primero...');
          const guardado = await handleGuardar();
          if (!guardado) {
            console.error('❌ Falló el guardado previo');
            console.groupEnd();
            return;
          }
          console.log('✅ Evaluación guardada, procediendo a finalizar...');
        } else {
          console.log('✅ Ya existe evaluación, procediendo a finalizar...');
        }

        console.log('🏁 Llamando finalizarEvaluacionFinal...');
        const respuesta = await finalizarEvaluacionFinal(practicante.id_practica);
        console.log('✅ Respuesta de finalización:', respuesta);
        
        mostrarNotificacion('exito', respuesta.mensaje || '🎉 Evaluación finalizada exitosamente');
        
        // ✅ FIX: Llamar a onSuccess INMEDIATAMENTE (con await)
        if (onSuccess) {
          console.log('🔄 Llamando onSuccess y recargando datos...');
          await onSuccess(); // ← CRÍTICO: await para que termine antes de cerrar
          console.log('✅ onSuccess completado');
        }
        
        // Esperar solo 500ms para que vea la notificación
        setTimeout(() => {
          console.log('✅ Cerrando modal...');
          onClose();
          console.log('🎉 FINALIZACIÓN EXITOSA');
          console.groupEnd();
        }, 500);
        
      } catch (error) {
        console.error('❌ ERROR AL FINALIZAR:', error);
        console.error('Detalles completos:', error.response);
        const mensaje = error.response?.data?.error || error.message;
        mostrarNotificacion('error', 'Error al finalizar: ' + mensaje);
        console.groupEnd();
      } finally {
        setGuardando(false);
      }
    }
  );
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
  const estaFinalizada = evaluacionExistente?.estado_evaluacion === 'completada';

  return (
    <>
      {/* 🔔 Sistema de notificaciones */}
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}

      {modalConfirmacion && (
        <ModalConfirmacion
          tipo={modalConfirmacion.tipo}
          titulo={modalConfirmacion.titulo}
          mensaje={modalConfirmacion.mensaje}
          onConfirmar={modalConfirmacion.onConfirmar}
          onCancelar={modalConfirmacion.onCancelar}
        />
      )}

      {/* Modal principal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl my-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-black">
                  {estaFinalizada ? '✅ Evaluación Completada' : evaluacionExistente ? '✏️ Editar Evaluación' : '📝 Nueva Evaluación'}
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

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-900">Paso {paso} de {totalPasos}</span>
                {progresoDetalles && (
                  <span className="text-xs text-gray-600 ml-3">
                    ({progresoDetalles.areas} áreas • {progresoDetalles.empleabilidad} empleabilidad)
                  </span>
                )}
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
              <StepIndicator numero={2} titulo="Tareas" activo={paso === 2} completado={paso > 2} />
              <StepIndicator numero={3} titulo="Empleabilidad" activo={paso === 3} completado={paso > 3} />
              <StepIndicator numero={4} titulo="Revisar" activo={paso === 4} completado={false} />
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {paso === 1 && <PasoAreasCompetencia areas={estructura.areas_competencia} evaluaciones={evaluacionesAreas} onActualizar={handleActualizarArea} escala={estructura.escalas.areas_tecnicas} />}
            {paso === 2 && <PasoTareas areas={estructura.areas_competencia} evaluaciones={evaluacionesTareas} onActualizar={handleActualizarTarea} escala={estructura.escalas.tareas} />}
            {paso === 3 && <PasoEmpleabilidad competencias={estructura.competencias_empleabilidad} evaluaciones={evaluacionesEmpleabilidad} onActualizar={handleActualizarEmpleabilidad} escala={estructura.escalas.empleabilidad} />}
            {paso === 4 && <PasoRevisar estructura={estructura} evaluacionesAreas={evaluacionesAreas} evaluacionesTareas={evaluacionesTareas} evaluacionesEmpleabilidad={evaluacionesEmpleabilidad} maestroGuia={maestroGuia} onActualizarMaestro={setMaestroGuia} />}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button onClick={handleAnterior} disabled={paso === 1 || estaFinalizada} className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
              ← Anterior
            </button>

            {paso < totalPasos ? (
              <button onClick={handleSiguiente} disabled={estaFinalizada} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition disabled:opacity-50">
                Siguiente →
              </button>
            ) : estaFinalizada ? (
              <div className="text-sm text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-xl">
                ✅ Evaluación completada
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleGuardar} disabled={guardando} className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-50">
                  {guardando ? '⏳ Guardando...' : '💾 Guardar Borrador'}
                </button>
                <button onClick={handleFinalizar} disabled={guardando} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition disabled:opacity-50">
                  {guardando ? '⏳ Finalizando...' : '🏁 Finalizar y Enviar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════ COMPONENTES AUXILIARES ═══════════════

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
        <p className="text-gray-600">Califica cada área de {escala.min} a {escala.max}</p>
      </div>

      {areas.map((area) => {
        const evaluacion = evaluaciones.find(e => e.id_area_competencia === area.id_area_competencia);
        
        return (
          <div key={area.id_area_competencia} className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-black text-white">{area.numero_area}</span>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-gray-900 mb-1">{area.nombre_area}</h5>
                {area.descripcion_area && <p className="text-sm text-gray-700">{area.descripcion_area}</p>}
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
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Comentarios (opcional)</label>
                <textarea
                  value={evaluacion?.comentarios || ''}
                  onChange={(e) => onActualizar(area.id_area_competencia, 'comentarios', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Ej: Excelente desempeño..."
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PasoTareas({ areas, evaluaciones, onActualizar, escala }) {
  const [areaExpandida, setAreaExpandida] = useState(null);

  const toggleArea = (idArea) => {
    setAreaExpandida(prev => prev === idArea ? null : idArea);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">✓ Evaluación de Tareas (Opcional)</h4>
        <p className="text-gray-600 mb-4">Puedes evaluar tareas específicas o continuar al siguiente paso.</p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">💡 Si no evalúas tareas, solo se considerarán las áreas técnicas.</p>
        </div>
      </div>

      {areas.map(area => (
        <div key={area.id_area_competencia} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleArea(area.id_area_competencia)}
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
                                type="button"
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
        <p className="text-gray-600">Evalúa las competencias transversales del estudiante</p>
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
                  {competencia.descripcion && <p className="text-sm text-gray-600">{competencia.descripcion}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {escala.opciones.map(opcion => (
                    <button
                      key={opcion}
                      type="button"
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
                  placeholder="Observaciones..."
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

  const rutInvalido = (maestroGuia.rut || '').trim() !== '' && !validateRutDigit(maestroGuia.rut);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-black text-gray-900 mb-2">📋 Resumen de Evaluación</h4>
        <p className="text-gray-600">Revisa los datos antes de finalizar</p>
      </div>

      <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4">📊 Áreas Técnicas</h5>
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
            <span className="text-lg font-bold text-gray-900">PROMEDIO</span>
            <span className="text-3xl font-black text-orange-600">{promedioAreas}</span>
          </div>
        </div>
      </div>

      {tareasRealizadas > 0 && (
        <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <p className="font-bold">✓ Tareas: {tareasRealizadas} evaluadas</p>
        </div>
      )}

      <div className="p-5 bg-purple-50 rounded-2xl border-2 border-purple-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4">👤 Empleabilidad</h5>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-emerald-600">{conteoEmpleabilidad.excelente}</p>
            <p className="text-xs text-gray-600">Excelente</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-blue-600">{conteoEmpleabilidad.bueno}</p>
            <p className="text-xs text-gray-600">Bueno</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-yellow-600">{conteoEmpleabilidad.suficiente}</p>
            <p className="text-xs text-gray-600">Suficiente</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-2xl font-black text-red-600">{conteoEmpleabilidad.insuficiente}</p>
            <p className="text-xs text-gray-600">Insuficiente</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
        <h5 className="text-lg font-bold text-gray-900 mb-4">✍️ Datos del Maestro Guía</h5>
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
              placeholder="Ej: Carlos Martínez"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">RUT</label>
            <input
              type="text"
              value={maestroGuia.rut}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, rut: formatRut(e.target.value) })}
              maxLength={12}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${
                rutInvalido ? 'border-red-500 focus:border-red-600 bg-red-50' : 'border-gray-200 focus:border-orange-500'
              }`}
              placeholder="12.345.678-9"
            />
            {rutInvalido && (
              <p className="mt-2 text-sm text-red-600">RUT inválido</p>
            )}
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              value={maestroGuia.email}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="carlos@empresa.cl"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Teléfono</label>
            <input
              type="tel"
              value={maestroGuia.telefono}
              onChange={(e) => onActualizarMaestro({ ...maestroGuia, telefono: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>
      </div>
    </div>
  );
}