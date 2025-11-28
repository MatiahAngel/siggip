// 📁 UBICACIÓN: frontend/src/componentes/profesor/ModalDetalleEstudiante.jsx
// 🎨 Modal con Tabs: Bitácora | Evaluaciones

import { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Eye, FileText, ChevronDown, ChevronUp, 
  CheckCircle, XCircle, Award, AlertCircle
} from 'lucide-react';
import { 
  obtenerBitacoraEstudiante,
  obtenerEvaluacionCompleta
} from '../../servicios/api/profesoresService';

export default function ModalDetalleEstudiante({ estudiante, onClose }) {
  const [activeTab, setActiveTab] = useState('bitacora');
  const [loading, setLoading] = useState(false);
  const [bitacora, setBitacora] = useState([]);
  const [evaluacion, setEvaluacion] = useState(null);

  useEffect(() => {
    if (activeTab === 'bitacora' && bitacora.length === 0) {
      cargarBitacora();
    }
    if (activeTab === 'evaluacion' && !evaluacion) {
      cargarEvaluacion();
    }
  }, [activeTab]);

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      const data = await obtenerBitacoraEstudiante(estudiante.id_practica);
      setBitacora(data);
      console.log('✅ Bitácora cargada:', data);
    } catch (error) {
      console.error('❌ Error cargando bitácora:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      const data = await obtenerEvaluacionCompleta(estudiante.id_practica);
      setEvaluacion(data);
      console.log('✅ Evaluación cargada:', data);
    } catch (error) {
      console.error('❌ Error cargando evaluación:', error);
      setEvaluacion(null);
    } finally {
      setLoading(false);
    }
  };

  const nombreCompleto = `${estudiante.estudiante_nombre} ${estudiante.apellido_paterno || ''} ${estudiante.apellido_materno || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-black">{nombreCompleto}</h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-green-100 text-sm">{estudiante.empresa_nombre}</p>
                <span className="text-green-100">•</span>
                <p className="text-green-100 text-sm">{estudiante.nombre_especialidad}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('bitacora')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'bitacora'
                  ? 'border-green-600 text-green-700 bg-white'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Bitácora</span>
              {bitacora.length > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === 'bitacora' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {bitacora.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('evaluacion')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'evaluacion'
                  ? 'border-green-600 text-green-700 bg-white'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Evaluación</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'bitacora' && (
            <TabBitacora bitacora={bitacora} loading={loading} />
          )}
          {activeTab === 'evaluacion' && (
            <TabEvaluacion evaluacion={evaluacion} loading={loading} estudiante={estudiante} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Código:</span> {estudiante.codigo_practica || 'N/A'}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== TAB: BITÁCORA ====================

function TabBitacora({ bitacora, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando bitácora...</p>
      </div>
    );
  }

  if (bitacora.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">Sin actividades registradas</h4>
        <p className="text-gray-600">El estudiante aún no ha registrado actividades en su bitácora</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-lg font-bold text-gray-900">
          📋 Actividades Registradas ({bitacora.length})
        </h4>
        <p className="text-sm text-gray-600">Haz clic en "Ver detalles" para expandir cada actividad</p>
      </div>

      {bitacora.map((actividad, index) => (
        <ActividadBitacora key={actividad.id_actividad_bitacora || index} actividad={actividad} />
      ))}
    </div>
  );
}

function ActividadBitacora({ actividad }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-all bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">
              {new Date(actividad.fecha_actividad).toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {actividad.descripcion_actividad}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ml-4 ${
            expanded 
              ? 'bg-green-100 text-green-700 font-semibold' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm">Ocultar</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span className="text-sm">Ver detalles</span>
            </>
          )}
        </button>
      </div>

      {/* Info básica */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">{actividad.horas_dedicadas || 0} horas</span>
        </div>
        {actividad.estado_actividad && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            actividad.estado_actividad === 'validada' 
              ? 'bg-green-100 text-green-700' 
              : actividad.estado_actividad === 'rechazada'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}>
            {actividad.estado_actividad === 'validada' && <CheckCircle className="w-3 h-3" />}
            {actividad.estado_actividad === 'rechazada' && <XCircle className="w-3 h-3" />}
            {actividad.estado_actividad === 'pendiente' && <AlertCircle className="w-3 h-3" />}
            <span>{actividad.estado_actividad}</span>
          </div>
        )}
      </div>

      {/* Detalles expandibles */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {actividad.equipos_utilizados && (
            <DetailItem 
              label="Equipos Utilizados" 
              value={actividad.equipos_utilizados}
              icon="🔧"
            />
          )}
          
          {actividad.herramientas_utilizadas && (
            <DetailItem 
              label="Herramientas" 
              value={actividad.herramientas_utilizadas}
              icon="🛠️"
            />
          )}
          
          {actividad.normas_seguridad_aplicadas && (
            <DetailItem 
              label="Normas de Seguridad" 
              value={actividad.normas_seguridad_aplicadas}
              icon="⚠️"
            />
          )}
          
          {actividad.observaciones && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-2">
                <span>💬</span> Comentarios de la Empresa:
              </p>
              <p className="text-sm text-blue-800">{actividad.observaciones}</p>
            </div>
          )}

          {actividad.fecha_registro && (
            <div className="text-xs text-gray-500 text-right pt-2">
              Registrada: {new Date(actividad.fecha_registro).toLocaleString('es-CL')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
        <span>{icon}</span> {label}:
      </p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

// ==================== TAB: EVALUACIÓN ====================

function TabEvaluacion({ evaluacion, loading, estudiante }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando evaluación...</p>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">Sin Evaluación Registrada</h4>
        <p className="text-gray-600 mb-4">
          La empresa aún no ha completado la evaluación final
        </p>
        <div className="max-w-md mx-auto text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> La evaluación estará disponible cuando:
          </p>
          <ul className="mt-2 text-sm text-blue-800 space-y-1 ml-4">
            <li>• El estudiante complete al menos 80% de las horas</li>
            <li>• La empresa complete la evaluación final</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Evaluación */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">Evaluación Final</h4>
            <p className="text-sm text-gray-600">Estado: {evaluacion.estado_evaluacion}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold ${
            evaluacion.estado_evaluacion === 'completada' 
              ? 'bg-green-100 text-green-700'
              : evaluacion.estado_evaluacion === 'certificada'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}>
            {evaluacion.estado_evaluacion === 'completada' && '✅ Completada'}
            {evaluacion.estado_evaluacion === 'certificada' && '🎓 Certificada'}
            {evaluacion.estado_evaluacion === 'en_proceso' && '⏳ En Proceso'}
          </div>
        </div>

        {/* Calificaciones */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-xs text-gray-600 mb-1">Calificación Empresa</p>
            <p className="text-3xl font-black text-purple-600">
              {evaluacion.calificacion_empresa || '-'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-xs text-gray-600 mb-1">Calificación Profesor</p>
            <p className="text-3xl font-black text-blue-600">
              {evaluacion.calificacion_profesor || '-'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-300">
            <p className="text-xs text-gray-600 mb-1">Calificación Final</p>
            <p className="text-3xl font-black text-green-600">
              {evaluacion.calificacion_final || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Áreas Evaluadas */}
      {evaluacion.evaluaciones_areas && evaluacion.evaluaciones_areas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Áreas de Competencia Evaluadas ({evaluacion.evaluaciones_areas.length})
          </h5>
          <div className="space-y-3">
            {evaluacion.evaluaciones_areas
              .filter(area => area.evaluador_tipo === 'maestro_guia')
              .map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{area.nombre_area}</p>
                    {area.comentarios && (
                      <p className="text-xs text-gray-600 mt-1">{area.comentarios}</p>
                    )}
                  </div>
                  <div className="text-2xl font-black text-purple-600 ml-4">
                    {area.calificacion}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Competencias de Empleabilidad */}
      {evaluacion.evaluaciones_empleabilidad && evaluacion.evaluaciones_empleabilidad.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Competencias de Empleabilidad ({evaluacion.evaluaciones_empleabilidad.length})
          </h5>
          <div className="grid md:grid-cols-2 gap-3">
            {evaluacion.evaluaciones_empleabilidad
              .filter(comp => comp.evaluador_tipo === 'maestro_guia')
              .map((comp, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-900">{comp.nombre_competencia}</p>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      comp.nivel_logro === 'E' ? 'bg-green-100 text-green-700' :
                      comp.nivel_logro === 'B' ? 'bg-blue-100 text-blue-700' :
                      comp.nivel_logro === 'S' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {comp.nivel_logro}
                    </span>
                  </div>
                  {comp.observaciones && (
                    <p className="text-xs text-gray-600">{comp.observaciones}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Comentarios */}
      {evaluacion.comentarios_empresa && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <h5 className="font-bold text-green-900 mb-3">💬 Comentarios de la Empresa</h5>
          <p className="text-sm text-green-800 leading-relaxed">{evaluacion.comentarios_empresa}</p>
        </div>
      )}

      {evaluacion.comentarios_profesor && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h5 className="font-bold text-blue-900 mb-3">💬 Comentarios del Profesor</h5>
          <p className="text-sm text-blue-800 leading-relaxed">{evaluacion.comentarios_profesor}</p>
        </div>
      )}

      {/* Resumen */}
      {evaluacion.resumen && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h5 className="font-bold text-gray-900 mb-3">📊 Resumen de Evaluación</h5>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Áreas Evaluadas</p>
              <p className="text-2xl font-bold text-gray-900">{evaluacion.resumen.total_areas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Tareas Evaluadas</p>
              <p className="text-2xl font-bold text-gray-900">{evaluacion.resumen.total_tareas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Competencias</p>
              <p className="text-2xl font-bold text-gray-900">{evaluacion.resumen.total_empleabilidad}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}