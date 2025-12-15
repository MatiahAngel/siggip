import React, { useEffect, useMemo, useState } from 'react';
import cliente from '../../../servicios/api/cliente.js';
import AdminLayout from '../../../components/layout/AdminLayout.jsx';
import StatCard from '../../../components/common/StatCard.jsx';
import Table from './components/Table.jsx';

// Datos de ejemplo (mock) para visualización
const MOCK_DATA = {
  kpiCobertura: {
    porcentaje: 62.5,
    totalEstudiantes: 120,
    conPractica: 75,
    detallePorEspecialidad: [
      { id_especialidad: 1, nombre_especialidad: 'Informática', total_estudiantes: 40, con_practica: 28, porcentaje: 70.0 },
      { id_especialidad: 2, nombre_especialidad: 'Contabilidad', total_estudiantes: 30, con_practica: 18, porcentaje: 60.0 },
      { id_especialidad: 3, nombre_especialidad: 'Mecánica', total_estudiantes: 20, con_practica: 10, porcentaje: 50.0 },
      { id_especialidad: 4, nombre_especialidad: 'Enfermería', total_estudiantes: 15, con_practica: 12, porcentaje: 80.0 },
      { id_especialidad: 5, nombre_especialidad: 'Turismo', total_estudiantes: 15, con_practica: 7, porcentaje: 46.67 },
    ],
  },
  kpiTiempoRevisionInformes: { promedioDias: 3.4 },
  kpiTiempoValidacionFinal: { promedioDias: 14.2 },
  kpiParticipacionEmpresarial: {
    empresasParticipantes: 8,
    topEmpresasPorPracticas: [
      { id_empresa: 10, razon_social: 'TechCorp', cantidad_practicas: 20 },
      { id_empresa: 12, razon_social: 'Servicios Globales', cantidad_practicas: 15 },
      { id_empresa: 8, razon_social: 'Manufacturas del Norte', cantidad_practicas: 12 },
      { id_empresa: 5, razon_social: 'Clínica Central', cantidad_practicas: 9 },
      { id_empresa: 18, razon_social: 'TurisChile', cantidad_practicas: 6 },
    ],
  },
};

function yearOptions() {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= current - 6; y--) arr.push(y);
  return arr;
}

export default function ReportesPage() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [errDetail, setErrDetail] = useState(null);
  const [usarEjemplo, setUsarEjemplo] = useState(true);

  const options = useMemo(() => yearOptions(), []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErr('');
      try {
        if (usarEjemplo) {
          setData(MOCK_DATA);
          setErrDetail(null);
        } else {
          const token = localStorage.getItem('token');
          // Evitar doble "/api": el baseURL ya incluye /api
          const resp = await cliente.get(`/reportes/resumen?anio=${anio}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setData(resp.data);
          setErrDetail(null);
        }
      } catch (e) {
        // Construir mensaje y detalle útiles para depurar
        const status = e?.response?.status;
        const statusText = e?.response?.statusText;
        const baseURL = e?.config?.baseURL || e?.response?.config?.baseURL || '';
        const url = e?.config?.url || e?.response?.config?.url || '';
        const fullUrl = baseURL ? `${baseURL}${url}` : url;
        let serverMsg = '';
        const data = e?.response?.data;
        if (typeof data === 'string') {
          // Evitar imprimir HTML entero; recortar
          serverMsg = data.replace(/<[^>]*>/g, '').slice(0, 200);
        } else if (data && typeof data === 'object') {
          serverMsg = JSON.stringify(data);
        }
        const msg = `Error ${status || ''} ${statusText || ''} al cargar reportes${fullUrl ? ` (${fullUrl})` : ''}. ${serverMsg || e.message}`.trim();
        console.error('[Reportes] Error al cargar:', { status, statusText, fullUrl, data: e?.response?.data, error: e });
        setErr(msg);
        setErrDetail({ status, statusText, fullUrl, preview: serverMsg });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [anio, usarEjemplo]);

  const coberturaPorEspecialidadRows = useMemo(() => {
    const detalle = data?.kpiCobertura?.detallePorEspecialidad || [];
    return detalle.map(d => ({
      especialidad: d.nombre_especialidad,
      total: d.total_estudiantes,
      conPractica: d.con_practica,
      porcentaje: `${d.porcentaje}%`
    }));
  }, [data]);

  const topEmpresasRows = useMemo(() => {
    const top = data?.kpiParticipacionEmpresarial?.topEmpresasPorPracticas || [];
    return top.map(t => ({
      empresa: t.razon_social,
      practicas: t.cantidad_practicas
    }));
  }, [data]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Encabezado con selector de año y toggle de datos de ejemplo */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-sm text-gray-600">Análisis descriptivo del sistema SIGGIP</p>
            {usarEjemplo && (
              <span className="inline-block mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                Usando datos de ejemplo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Año</label>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                disabled={usarEjemplo}
                title={usarEjemplo ? 'Desactiva datos de ejemplo para cambiar el año' : 'Selecciona el año'}
              >
                {options.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={usarEjemplo}
                onChange={(e) => setUsarEjemplo(e.target.checked)}
                className="rounded border-gray-300"
              />
              Datos de ejemplo
            </label>
          </div>
        </div>

        {loading && <div className="text-sm">Cargando...</div>}
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <div className="font-medium mb-1">{err}</div>
            {errDetail && (
              <div className="text-xs text-red-600 space-y-1">
                {errDetail.fullUrl && <div><span className="font-semibold">URL:</span> {errDetail.fullUrl}</div>}
                {typeof errDetail.preview === 'string' && errDetail.preview && (
                  <pre className="whitespace-pre-wrap break-words bg-white border rounded p-2 max-h-40 overflow-auto">{errDetail.preview}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {!loading && !err && data && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Cobertura" value={`${data.kpiCobertura?.porcentaje ?? 0}%`} icon="📈" trend={`${data.kpiCobertura?.conPractica ?? 0} / ${data.kpiCobertura?.totalEstudiantes ?? 0}`} trendUp={(data.kpiCobertura?.porcentaje ?? 0) >= 0} bgColor="from-gray-700 to-gray-800" />
              <StatCard title="Prom. revisión informes" value={`${data.kpiTiempoRevisionInformes?.promedioDias ?? 0} días`} icon="📝" bgColor="from-slate-600 to-slate-700" />
              <StatCard title="Prom. validación final" value={`${data.kpiTiempoValidacionFinal?.promedioDias ?? 0} días`} icon="✅" bgColor="from-amber-600 to-yellow-600" />
              <StatCard title="Empresas participantes" value={`${data.kpiParticipacionEmpresarial?.empresasParticipantes ?? 0}`} icon="🏢" bgColor="from-gray-700 to-gray-800" />
            </div>

            {/* Tablas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Cobertura por especialidad</h2>
                </div>
                <Table
                  columns={["Especialidad", "Total", "Con práctica", "%"]}
                  rows={coberturaPorEspecialidadRows}
                  keys={["especialidad", "total", "conPractica", "porcentaje"]}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Top empresas por prácticas</h2>
                </div>
                <Table
                  columns={["Empresa", "Prácticas"]}
                  rows={topEmpresasRows}
                  keys={["empresa", "practicas"]}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
