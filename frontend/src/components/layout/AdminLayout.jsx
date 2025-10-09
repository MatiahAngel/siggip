import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '👥', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: '🏢', label: 'Empresas', path: '/admin/empresas' },
    { icon: '🎓', label: 'Especialidades', path: '/admin/especialidades' },
    { icon: '💼', label: 'Ofertas', path: '/admin/ofertas' },
    { icon: '📈', label: 'Reportes', path: '/admin/reportes' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - GRIS OSCURO PROFESIONAL */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 shadow-2xl`}
        style={{ width: '280px' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo del Liceo - CON SUTIL BORDE DORADO */}
          <div className="flex flex-col items-center mb-8 px-3">
            {/* Logo con marco sutil */}
            <div className="w-20 h-20 bg-white rounded-xl shadow-xl p-2 mb-3 ring-2 ring-yellow-600 ring-opacity-50 hover:ring-opacity-100 hover:scale-105 transition-all">
              <img 
                src="/logo-liceo.jpg" 
                alt="Logo Liceo" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* Título */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">SIGGIP</h2>
              <p className="text-xs text-gray-400 font-medium">Panel Administrativo</p>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mt-2"></div>
            </div>
          </div>

          {/* Menu Items - HOVER SUTIL CON ACENTO DORADO */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg border-l-4 border-yellow-600'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:border-l-4 hover:border-yellow-600/50'
                  }`}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer - SUTIL */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="bg-gray-800 rounded-lg p-3 text-gray-300 text-sm border border-gray-700 shadow-lg">
              <p className="font-semibold text-white">Sistema SIGGIP</p>
              <p className="text-xs text-gray-400">Liceo Padre José Herde</p>
              <p className="text-xs text-yellow-600 mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-[280px]' : 'ml-0'} transition-all`}>
        {/* Navbar - BLANCO LIMPIO CON SUTIL ACENTO */}
        <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Toggle Sidebar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Administración</span>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-semibold">
                  {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
                </span>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md ring-2 ring-yellow-600 ring-opacity-30">
                    <span className="text-white font-semibold">
                      {user?.nombre?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.nombre || 'Administrador'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.tipo_usuario || 'Admin'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Sesión activa</p>
                      <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                    </div>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-medium transition-colors">
                      <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </button>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-medium transition-colors">
                      <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </button>
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}