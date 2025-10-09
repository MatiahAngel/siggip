// 📁 UBICACIÓN: frontend/src/paginas/admin/Dashboard.jsx
// 🎯 Dashboard principal - TEMA GRIS PROFESIONAL CON ACENTOS

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

import {
  getDashboardStats,
  getTopEmpresas,
  getAuditoriaReciente,
} from '../../servicios/api/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalEmpresas: 0,
    totalPracticas: 0,
    practicasActivas: 0,
    variaciones: {
      usuarios: 0,
      empresas: 0,
      practicas: 0,
      practicasActivas: 0,
    },
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [topEmpresas, setTopEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError('');

        const [s, tops, logs] = await Promise.all([
          getDashboardStats().catch(() => null),
          getTopEmpresas({ limit: 5 }).catch(() => null),
          getAuditoriaReciente({ limit: 10 }).catch(() => null),
        ]);

        if (s) {
          setStats({
            totalUsuarios: s.totalUsuarios ?? 0,
            totalEmpresas: s.totalEmpresas ?? 0,
            totalPracticas: s.totalPracticas ?? 0,
            practicasActivas: s.practicasActivas ?? 0,
            variaciones: s.variaciones ?? {
              usuarios: 0,
              empresas: 0,
              practicas: 0,
              practicasActivas: 0,
            },
          });
        } else {
          setStats({
            totalUsuarios: 156,
            totalEmpresas: 42,
            totalPracticas: 89,
            practicasActivas: 34,
            variaciones: { usuarios: 12, empresas: 8, practicas: 15, practicasActivas: -3 },
          });
        }

        setTopEmpresas(
          tops?.length
            ? tops
            : [
                { nombre: 'TechCorp', practicantes: 12, rating: 4.8 },
                { nombre: 'InnovaLab', practicantes: 8, rating: 4.6 },
                { nombre: 'Digital Solutions', practicantes: 6, rating: 4.5 },
                { nombre: 'AgriTech', practicantes: 5, rating: 4.7 },
              ]
        );

        setRecentActivities(
          logs?.length
            ? logs
            : [
                {
                  id_log: 1,
                  usuario_nombre: 'Juan Pérez',
                  accion: 'create',
                  entidad: 'usuarios',
                  descripcion: 'Se registró en el sistema',
                  ip: '127.0.0.1',
                  created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                },
                {
                  id_log: 2,
                  usuario_nombre: 'Empresa TechCorp',
                  accion: 'create',
                  entidad: 'ofertas',
                  descripcion: 'Publicó nueva oferta',
                  ip: '127.0.0.1',
                  created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                },
                {
                  id_log: 3,
                  usuario_nombre: 'María González',
                  accion: 'update',
                  entidad: 'practicas',
                  descripcion: 'Completó práctica',
                  ip: '127.0.0.1',
                  created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                },
                {
                  id_log: 4,
                  usuario_nombre: 'Admin',
                  accion: 'approve',
                  entidad: 'empresas',
                  descripcion: 'Aprobó nueva empresa',
                  ip: '127.0.0.1',
                  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                },
              ]
        );
      } catch (e) {
        console.error(e);
        setError('Ocurrió un error al cargar el dashboard.');
      } finally {
        setLoading(false);
        setTimeout(() => setSoftLoading(false), 250);
      }
    };

    cargar();
  }, []);

  // COLORES EQUILIBRADOS - Gris, Rojo y Dorado sutiles
  const trendInfo = useMemo(
    () => [
      {
        title: 'Total Usuarios',
        value: stats.totalUsuarios,
        icon: '👥',
        trend: `${stats.variaciones?.usuarios ?? 0}%`,
        trendUp: (stats.variaciones?.usuarios ?? 0) >= 0,
        bgColor: 'from-slate-600 to-slate-700',
      },
      {
        title: 'Empresas Activas',
        value: stats.totalEmpresas,
        icon: '🏢',
        trend: `${stats.variaciones?.empresas ?? 0}%`,
        trendUp: (stats.variaciones?.empresas ?? 0) >= 0,
        bgColor: 'from-yellow-600 to-amber-600',
      },
      {
        title: 'Prácticas Totales',
        value: stats.totalPracticas,
        icon: '📋',
        trend: `${stats.variaciones?.practicas ?? 0}%`,
        trendUp: (stats.variaciones?.practicas ?? 0) >= 0,
        bgColor: 'from-gray-700 to-gray-800',
      },
      {
        title: 'Prácticas Activas',
        value: stats.practicasActivas,
        icon: '⚡',
        trend: `${stats.variaciones?.practicasActivas ?? 0}%`,
        trendUp: (stats.variaciones?.practicasActivas ?? 0) >= 0,
        bgColor: 'from-red-600 to-red-700',
      },
    ],
    [stats]
  );

  const activityIcon = (entidad, accion) => {
    const t = String(entidad || '').toLowerCase();
    const a = String(accion || '').toLowerCase();

    if (t.includes('usuario')) return '👤';
    if (t.includes('empresa')) return '🏢';
    if (t.includes('oferta')) return '💼';
    if (t.includes('practica')) return '✅';

    if (a.includes('approve') || a.includes('aprob')) return '🛡️';
    if (a.includes('delete') || a.includes('elimi')) return '🗑️';
    if (a.includes('update') || a.includes('edit')) return '✏️';
    if (a.includes('create') || a.includes('crea')) return '➕';
    return '⚙️';
  };

  const activityPillClass = (entidad) => {
    const t = String(entidad || '').toLowerCase();
    if (t.includes('usuario')) return 'bg-slate-100 text-slate-800';
    if (t.includes('empresa')) return 'bg-amber-100 text-amber-800';
    if (t.includes('oferta')) return 'bg-gray-100 text-gray-800';
    if (t.includes('practica')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-gray-100 text-gray-800';
  };

  const timeAgo = (iso) => {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Hace instantes';
      if (mins < 60) return `Hace ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      const days = Math.floor(hours / 24);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } catch {
      return '';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header profesional con sutil acento dorado */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
          {/* Sutil patrón decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600 opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">📊</span>
                Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Bienvenido al panel de administración
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">Sistema activo</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {softLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse"
                >
                  <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              ))
            : trendInfo.map((kpi) => (
                <StatCard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  trend={kpi.trend}
                  trendUp={kpi.trendUp}
                  bgColor={kpi.bgColor}
                />
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-xl">🗂️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
            </div>

            {softLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-gray-100 rounded-lg" />
                <div className="h-16 bg-gray-100 rounded-lg" />
                <div className="h-16 bg-gray-100 rounded-lg" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl">🫙</span>
                </div>
                <p className="text-gray-600">No hay actividad reciente</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentActivities.map((a) => (
                    <div
                      key={a.id_log ?? a.id ?? `${a.entidad}-${a.created_at}`}
                      className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${activityPillClass(
                          a.entidad
                        )}`}
                      >
                        <span className="text-lg">{activityIcon(a.entidad, a.accion)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {a.usuario_nombre || a.usuario || 'Sistema'}
                        </p>
                        <p className="text-sm text-gray-700">
                          {a.descripcion ||
                            `${String(a.accion || '').toUpperCase()} en ${String(a.entidad || '').toUpperCase()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {timeAgo(a.created_at)} {a.ip ? `• ${a.ip}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-semibold hover:bg-gray-50 rounded-lg transition-colors">
                  Ver todas las actividades →
                </button>
              </>
            )}
          </div>

          {/* Top Empresas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Top Empresas</h2>
            </div>

            {softLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-gray-100 rounded-lg" />
                <div className="h-16 bg-gray-100 rounded-lg" />
                <div className="h-16 bg-gray-100 rounded-lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {topEmpresas.map((empresa, index) => (
                  <div
                    key={`${empresa.nombre}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center ring-2 ring-yellow-600 ring-opacity-30">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{empresa.nombre}</p>
                        <p className="text-xs text-gray-600">{empresa.practicantes} practicantes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Number(empresa.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-600 hover:to-slate-700 rounded-lg text-center transition-all group border border-slate-200 hover:border-slate-600 shadow-sm hover:shadow-md">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-white">Nuevo Usuario</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-600 hover:to-amber-700 rounded-lg text-center transition-all group border border-amber-200 hover:border-amber-600 shadow-sm hover:shadow-md">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-white">Nueva Empresa</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-700 hover:to-gray-800 rounded-lg text-center transition-all group border border-gray-200 hover:border-gray-700 shadow-sm hover:shadow-md">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💼</div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-white">Nueva Oferta</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-600 hover:to-red-700 rounded-lg text-center transition-all group border border-red-200 hover:border-red-600 shadow-sm hover:shadow-md">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📈</div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-white">Ver Reportes</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}