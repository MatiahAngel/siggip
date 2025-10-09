// 📁 UBICACIÓN: frontend/src/components/ofertas/DetalleOferta.jsx
// 🎯 Vista detallada de una oferta de práctica - TEMA GRIS PROFESIONAL

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
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-center">Cargando oferta...</p>
        </div>
      </div>
    );
  }

  if (error || !oferta) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header Gris Profesional */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-t-xl flex-shrink-0">
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
                <span className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md">
                  {oferta.codigo_oferta}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold mb-1 break-words">{oferta.titulo_oferta}</h1>
              <p className="text-gray-300 flex items-center gap-1.5 text-sm">
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
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getModalidadIcon(oferta.modalidad_trabajo)}</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Modalidad</span>
              </div>
              <p className="font-bold text-gray-900 text-lg capitalize">{oferta.modalidad_trabajo}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-xs text-gray-600 font-semibold uppercase">Duración</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{oferta.duracion_horas}h</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">📋</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Descripción de la práctica</h2>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {oferta.descripcion}
              </p>
            </div>
          </section>

          {/* REQUISITOS DESTACADOS */}
          {oferta.requisitos && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Requisitos Importantes</h2>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 rounded-lg p-4 shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <p className="text-xs text-red-800 font-bold uppercase">
                    Asegúrate de cumplir con todos estos requisitos antes de postular
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                  <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                    {oferta.requisitos}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Detalles */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">📍</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detalles de la práctica</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Especialidad</p>
                  <p className="font-bold text-gray-900 text-sm">{oferta.nombre_especialidad}</p>
                </div>
              </div>

              {oferta.ubicacion && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Ubicación</p>
                    <p className="font-bold text-gray-900 text-sm">{oferta.ubicacion}</p>
                  </div>
                </div>
              )}

              {oferta.horario_trabajo && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Horario</p>
                    <p className="font-bold text-gray-900 text-sm">{oferta.horario_trabajo}</p>
                  </div>
                </div>
              )}

              {oferta.salario_referencial && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Salario</p>
                    <p className="font-bold text-gray-900 text-sm">{formatearSalario(oferta.salario_referencial)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Inicio</p>
                  <p className="font-bold text-gray-900 text-sm">{formatearFecha(oferta.fecha_inicio)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Postula hasta</p>
                  <p className="font-bold text-gray-900 text-sm">{formatearFecha(oferta.fecha_limite_postulacion)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Beneficios */}
          {oferta.beneficios && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">🎁</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Beneficios</h2>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {oferta.beneficios}
                </p>
              </div>
            </section>
          )}

          {/* INFORMACIÓN COMPLETA DE LA EMPRESA */}
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">🏢</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información de la Empresa</h2>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-5 shadow-md">
              {/* Datos principales */}
              <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">Razón Social</p>
                    <p className="text-gray-900 font-bold text-sm">{oferta.empresa_nombre}</p>
                  </div>
                  
                  {oferta.empresa_comercial && (
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase mb-1">Nombre Comercial</p>
                      <p className="text-gray-900 font-bold text-sm">{oferta.empresa_comercial}</p>
                    </div>
                  )}
                  
                  {oferta.rut_empresa && (
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase mb-1">RUT</p>
                      <p className="text-gray-900 font-semibold text-sm">{oferta.rut_empresa}</p>
                    </div>
                  )}
                  
                  {oferta.giro_comercial && (
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase mb-1">Giro Comercial</p>
                      <p className="text-gray-900 font-semibold text-sm">{oferta.giro_comercial}</p>
                    </div>
                  )}
                  
                  {oferta.sector_economico && (
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase mb-1">Sector Económico</p>
                      <p className="text-gray-900 font-semibold text-sm">{oferta.sector_economico}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación de la empresa */}
              {(oferta.direccion_empresa || oferta.comuna_empresa || oferta.region_empresa) && (
                <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📍</span>
                    <p className="text-sm font-bold text-gray-800">Ubicación de la Empresa</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {oferta.direccion_empresa && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Dirección</p>
                        <p className="text-gray-900 text-sm font-medium">{oferta.direccion_empresa}</p>
                      </div>
                    )}
                    {oferta.comuna_empresa && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Comuna</p>
                        <p className="text-gray-900 text-sm font-medium">{oferta.comuna_empresa}</p>
                      </div>
                    )}
                    {oferta.region_empresa && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Región</p>
                        <p className="text-gray-900 text-sm font-medium">{oferta.region_empresa}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contacto de la empresa */}
              {(oferta.telefono_empresa || oferta.email_contacto_empresa || oferta.contacto_principal || oferta.cargo_contacto) && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📞</span>
                    <p className="text-sm font-bold text-gray-800">Información de Contacto</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {oferta.contacto_principal && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Contacto Principal</p>
                        <p className="text-gray-900 text-sm font-bold">{oferta.contacto_principal}</p>
                      </div>
                    )}
                    {oferta.cargo_contacto && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Cargo</p>
                        <p className="text-gray-900 text-sm font-medium">{oferta.cargo_contacto}</p>
                      </div>
                    )}
                    {oferta.telefono_empresa && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Teléfono</p>
                        <p className="text-gray-900 text-sm font-bold">{oferta.telefono_empresa}</p>
                      </div>
                    )}
                    {oferta.email_contacto_empresa && (
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Email</p>
                        <p className="text-gray-900 text-sm font-bold">{oferta.email_contacto_empresa}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Fijo */}
        <div className="border-t bg-white px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cerrar
            </button>
            {onEditar && (
              <button
                onClick={() => {
                  onClose();
                  onEditar(oferta);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md"
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