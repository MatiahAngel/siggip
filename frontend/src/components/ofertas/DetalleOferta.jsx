// 📁 UBICACIÓN: frontend/src/components/ofertas/DetalleOferta.jsx
// 🎯 Vista detallada de una oferta de práctica - VERSIÓN CON MEJOR CONTRASTE

import { useState, useEffect } from 'react';
import { getOfertaById } from '../../servicios/api/ofertasService';

export default function DetalleOferta({ idOferta, onClose, onEditar }) {
  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOferta();
  }, [idOferta]);

  const fetchOferta = async () => {
    try {
      setLoading(true);
      const data = await getOfertaById(idOferta);
      setOferta(data);
    } catch (err) {
      console.error('Error al cargar oferta:', err);
      setError('Error al cargar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearSalario = (salario) => {
    if (!salario) return 'No especificado';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(salario);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      activa: 'bg-emerald-500 text-white',
      pausada: 'bg-amber-500 text-white',
      cerrada: 'bg-slate-500 text-white'
    };
    return badges[estado] || badges.cerrada;
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      activa: '✅',
      pausada: '⏸️',
      cerrada: '🔒'
    };
    return icons[estado] || '📋';
  };

  const getModalidadIcon = (modalidad) => {
    const icons = {
      presencial: '🏢',
      remoto: '💻',
      hibrido: '🔄'
    };
    return icons[modalidad] || '🏢';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-center">Cargando oferta...</p>
        </div>
      </div>
    );
  }

  if (error || !oferta) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md shadow-xl">
          <div className="text-center mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <p className="text-red-600 text-center mb-6 font-medium">{error || 'Oferta no encontrada'}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <span className="text-xl leading-none font-bold text-white">✕</span>
          </button>
          
          <div className="flex items-start gap-4 pr-12">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl">🏢</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getEstadoBadge(oferta.estado_oferta)} flex items-center gap-1.5 shadow-md`}>
                  <span>{getEstadoIcon(oferta.estado_oferta)}</span>
                  <span className="capitalize">{oferta.estado_oferta}</span>
                </span>
                <span className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-md">
                  {oferta.codigo_oferta}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold mb-1 break-words">{oferta.titulo_oferta}</h1>
              <p className="text-blue-100 flex items-center gap-1.5 text-sm">
                <span>🏢</span>
                <span className="truncate">{oferta.empresa_nombre}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getModalidadIcon(oferta.modalidad_trabajo)}</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Modalidad</span>
              </div>
              <p className="font-bold text-gray-900 text-lg capitalize">{oferta.modalidad_trabajo}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Duración</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{oferta.duracion_horas}h</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Cupos</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{oferta.cupos_disponibles}</p>
            </div>
          </div>

          {/* Descripción */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Descripción de la práctica</h2>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {oferta.descripcion}
              </p>
            </div>
          </section>

          {/* Detalles */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📍</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detalles de la práctica</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Especialidad</p>
                  <p className="font-bold text-gray-900 text-sm">{oferta.nombre_especialidad}</p>
                </div>
              </div>

              {oferta.ubicacion && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Ubicación</p>
                    <p className="font-bold text-gray-900 text-sm">{oferta.ubicacion}</p>
                  </div>
                </div>
              )}

              {oferta.horario_trabajo && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Horario</p>
                    <p className="font-bold text-gray-900 text-sm">{oferta.horario_trabajo}</p>
                  </div>
                </div>
              )}

              {oferta.salario_referencial && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Salario</p>
                    <p className="font-bold text-gray-900 text-sm">{formatearSalario(oferta.salario_referencial)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Inicio</p>
                  <p className="font-bold text-gray-900 text-sm">{formatearFecha(oferta.fecha_inicio)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Postula hasta</p>
                  <p className="font-bold text-gray-900 text-sm">{formatearFecha(oferta.fecha_limite_postulacion)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Requisitos */}
          {oferta.requisitos && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Requisitos</h2>
              </div>
              <div className="bg-white border-2 border-emerald-300 rounded-lg p-4 shadow-sm">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {oferta.requisitos}
                </p>
              </div>
            </section>
          )}

          {/* Beneficios */}
          {oferta.beneficios && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎁</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Beneficios</h2>
              </div>
              <div className="bg-white border-2 border-pink-300 rounded-lg p-4 shadow-sm">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {oferta.beneficios}
                </p>
              </div>
            </section>
          )}

          {/* Empresa */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Sobre la empresa</h2>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-bold text-gray-700">Razón Social: </span>
                  <span className="text-gray-900">{oferta.empresa_nombre}</span>
                </div>
                {oferta.empresa_comercial && (
                  <div>
                    <span className="font-bold text-gray-700">Nombre Comercial: </span>
                    <span className="text-gray-900">{oferta.empresa_comercial}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Fijo */}
        <div className="border-t-2 bg-white px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Cerrar
            </button>
            {onEditar && (
              <button
                onClick={() => {
                  onClose();
                  onEditar(oferta);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600 text-center font-medium">
            Publicada el {formatearFecha(oferta.fecha_creacion)}
          </p>
        </div>
      </div>
    </div>
  );
}