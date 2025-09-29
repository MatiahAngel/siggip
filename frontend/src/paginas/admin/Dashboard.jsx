// 📁 UBICACIÓN: frontend/src/paginas/admin/Dashboard.jsx
// 🎯 Dashboard principal del administrador con estadísticas

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

export default function Dashboard() {
  // Datos simulados - Reemplazar con llamadas API reales
  const [stats, setStats] = useState({
    totalUsuarios: 156,
    totalEmpresas: 42,
    totalPracticas: 89,
    practicasActivas: 34,
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'Juan Pérez', action: 'Se registró en el sistema', time: 'Hace 5 min', type: 'user' },
    { id: 2, user: 'Empresa TechCorp', action: 'Publicó nueva oferta', time: 'Hace 15 min', type: 'offer' },
    { id: 3, user: 'María González', action: 'Completó práctica', time: 'Hace 1 hora', type: 'practice' },
    { id: 4, user: 'Admin', action: 'Aprobó nueva empresa', time: 'Hace 2 horas', type: 'admin' },
  ]);

  const [topEmpresas, setTopEmpresas] = useState([
    { nombre: 'TechCorp', practicantes: 12, rating: 4.8 },
    { nombre: 'InnovaLab', practicantes: 8, rating: 4.6 },
    { nombre: 'Digital Solutions', practicantes: 6, rating: 4.5 },
    { nombre: 'AgriTech', practicantes: 5, rating: 4.7 },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido al panel de administración</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsuarios}
            icon="👥"
            trend="+12%"
            trendUp={true}
            bgColor="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Empresas Activas"
            value={stats.totalEmpresas}
            icon="🏢"
            trend="+8%"
            trendUp={true}
            bgColor="from-green-500 to-green-600"
          />
          <StatCard
            title="Prácticas Totales"
            value={stats.totalPracticas}
            icon="📋"
            trend="+15%"
            trendUp={true}
            bgColor="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Prácticas Activas"
            value={stats.practicasActivas}
            icon="⚡"
            trend="-3%"
            trendUp={false}
            bgColor="from-orange-500 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'offer' ? 'bg-green-100' :
                    activity.type === 'practice' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <span className="text-lg">
                      {activity.type === 'user' ? '👤' :
                       activity.type === 'offer' ? '💼' :
                       activity.type === 'practice' ? '✅' :
                       '⚙️'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todas las actividades →
            </button>
          </div>

          {/* Top Empresas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Empresas</h2>
            <div className="space-y-4">
              {topEmpresas.map((empresa, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{empresa.nombre}</p>
                      <p className="text-xs text-gray-600">{empresa.practicantes} practicantes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold text-gray-900">{empresa.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
              <p className="text-sm font-medium text-gray-900">Nuevo Usuario</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
              <p className="text-sm font-medium text-gray-900">Nueva Empresa</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💼</div>
              <p className="text-sm font-medium text-gray-900">Nueva Oferta</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
              <p className="text-sm font-medium text-gray-900">Ver Reportes</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}