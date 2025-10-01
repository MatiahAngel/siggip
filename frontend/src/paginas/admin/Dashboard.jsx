// 📁 UBICACIÓN: frontend/src/paginas/admin/Dashboard.jsx
// 🎯 Dashboard principal del administrador — ESTILO ALTO CONTRASTE + Auditoría

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

// 🚀 Servicios esperados (implémentalos en tu capa de API)
// - getDashboardStats() -> { totalUsuarios, totalEmpresas, totalPracticas, practicasActivas, variaciones?: {...} }
// - getTopEmpresas({limit}) -> [{ nombre, practicantes, rating }]
// - getAuditoriaReciente({limit}) -> logs de `logs_auditoria`
import {
  getDashboardStats,
  getTopEmpresas,
  getAuditoriaReciente,
} from '../../servicios/api/dashboardService';

export default function Dashboard() {
  // ======= Estado =======
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
  const [softLoading, setSoftLoading] = useState(true); // skeleton corto
  const [error, setError] = useState('');

  // ======= Carga inicial =======
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError('');

        // Intenta cargar de API
        const [s, tops, logs] = await Promise.all([
          getDashboardStats().catch(() => null),
          getTopEmpresas({ limit: 5 }).catch(() => null),
          getAuditoriaReciente({ limit: 10 }).catch(() => null),
        ]);

        // Stats
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
          // fallback demo si aún no tienes endpoints
          setStats({
            totalUsuarios: 156,
            totalEmpresas: 42,
            totalPracticas: 89,
            practicasActivas: 34,
            variaciones: { usuarios: 12, empresas: 8, practicas: 15, practicasActivas: -3 },
          });
        }

        // Top empresas
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

        // Auditoría (Actividad reciente)
        setRecentActivities(
          logs?.length
            ? logs
            : [
                // Fallback si no hay API todavía
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
        setTimeout(() => setSoftLoading(false), 250); // micro delay p/skeleton suave
      }
    };

    cargar();
  }, []);

  // ======= Helpers UI =======
  const trendInfo = useMemo(
    () => [
      {
        title: 'Total Usuarios',
        value: stats.totalUsuarios,
        icon: '👥',
        trend: `${stats.variaciones?.usuarios ?? 0}%`,
        trendUp: (stats.variaciones?.usuarios ?? 0) >= 0,
        bgColor: 'from-blue-500 to-blue-600',
      },
      {
        title: 'Empresas Activas',
        value: stats.totalEmpresas,
        icon: '🏢',
        trend: `${stats.variaciones?.empresas ?? 0}%`,
        trendUp: (stats.variaciones?.empresas ?? 0) >= 0,
        bgColor: 'from-emerald-500 to-emerald-600',
      },
      {
        title: 'Prácticas Totales',
        value: stats.totalPracticas,
        icon: '📋',
        trend: `${stats.variaciones?.practicas ?? 0}%`,
        trendUp: (stats.variaciones?.practicas ?? 0) >= 0,
        bgColor: 'from-purple-500 to-purple-600',
      },
      {
        title: 'Prácticas Activas',
        value: stats.practicasActivas,
        icon: '⚡',
        trend: `${stats.variaciones?.practicasActivas ?? 0}%`,
        trendUp: (stats.variaciones?.practicasActivas ?? 0) >= 0,
        bgColor: 'from-orange-500 to-orange-600',
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

    // por tipo de acción
    if (a.includes('approve') || a.includes('aprob')) return '🛡️';
    if (a.includes('delete') || a.includes('elimi')) return '🗑️';
    if (a.includes('update') || a.includes('edit')) return '✏️';
    if (a.includes('create') || a.includes('crea')) return '➕';
    return '⚙️';
  };

  const activityPillClass = (entidad) => {
    const t = String(entidad || '').toLowerCase();
    if (t.includes('usuario')) return 'bg-blue-100';
    if (t.includes('empresa')) return 'bg-emerald-100';
    if (t.includes('oferta')) return 'bg-indigo-100';
    if (t.includes('practica')) return 'bg-purple-100';
    return 'bg-orange-100';
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

  // ======= UI =======
  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold flex items-center gap-3">
                <span className="text-5xl">📊</span>
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg">Bienvenido al panel de administración</p>
            </div>
          </div>
        </div>

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
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
                  className="rounded-2xl border-2 border-gray-200 bg-white p-6 animate-pulse"
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
          {/* Actividad Reciente (logs_auditoria) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗂️</span>
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
            </div>

            {softLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-14 bg-gray-100 rounded" />
                <div className="h-14 bg-gray-100 rounded" />
                <div className="h-14 bg-gray-100 rounded" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🫙</span>
                </div>
                <p className="text-gray-600">No hay actividad reciente</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentActivities.map((a) => (
                    <div
                      key={a.id_log ?? a.id ?? `${a.entidad}-${a.created_at}`}
                      className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${activityPillClass(
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
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(a.created_at)} {a.ip ? `• ${a.ip}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold">
                  Ver todas las actividades →
                </button>
              </>
            )}
          </div>

          {/* Top Empresas */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-900">Top Empresas</h2>
            </div>

            {softLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                {topEmpresas.map((empresa, index) => (
                  <div
                    key={`${empresa.nombre}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{empresa.nombre}</p>
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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
              <p className="text-sm font-semibold text-gray-900">Nuevo Usuario</p>
            </button>
            <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
              <p className="text-sm font-semibold text-gray-900">Nueva Empresa</p>
            </button>
            <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💼</div>
              <p className="text-sm font-semibold text-gray-900">Nueva Oferta</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📈</div>
              <p className="text-sm font-semibold text-gray-900">Ver Reportes</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
