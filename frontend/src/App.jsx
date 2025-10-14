// 📁 UBICACIÓN: frontend/src/App.jsx
// 🎯 ACTUALIZACIÓN: Dashboard estudiante real

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Welcome from './paginas/Welcome';
import Login from './paginas/autenticacion/Login';
import LoginEstudiante from './paginas/autenticacion/LoginEstudiante';
import Dashboard from './paginas/admin/Dashboard';
import ListaUsuarios from './paginas/admin/usuarios/ListaUsuarios';
import Empresas from './paginas/admin/empresas/index';
import ListaEspecialidades from './paginas/admin/especialidades/ListaEspecialidades';
import ListaOfertas from './paginas/admin/ofertas';
import DashboardEstudiante from './paginas/estudiante/DashboardEstudiante';

const TempPage = ({ title }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-4">Esta página está en desarrollo</p>
      <p className="text-sm text-gray-500">Será implementada próximamente</p>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
      <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Volver al inicio
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login/estudiante" element={<LoginEstudiante />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['administrador', 'directivo']}><Dashboard /></PrivateRoute>} />
          <Route path="/admin/usuarios" element={<PrivateRoute roles={['administrador', 'directivo']}><ListaUsuarios /></PrivateRoute>} />
          <Route path="/admin/empresas" element={<PrivateRoute roles={['administrador', 'directivo']}><Empresas /></PrivateRoute>} />
          <Route path="/admin/especialidades" element={<PrivateRoute roles={['administrador', 'directivo']}><ListaEspecialidades /></PrivateRoute>} />
          <Route path="/admin/ofertas" element={<PrivateRoute roles={['administrador', 'directivo']}><ListaOfertas /></PrivateRoute>} />
          <Route path="/admin/reportes" element={<PrivateRoute roles={['administrador', 'directivo']}><TempPage title="Reportes" /></PrivateRoute>} />
          <Route path="/profesor/dashboard" element={<PrivateRoute roles="profesor"><TempPage title="Dashboard Profesor" /></PrivateRoute>} />
          <Route path="/estudiante/dashboard" element={<PrivateRoute roles="estudiante"><DashboardEstudiante /></PrivateRoute>} />
          <Route path="/empresa/dashboard" element={<PrivateRoute roles="empresa"><TempPage title="Dashboard Empresa" /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;