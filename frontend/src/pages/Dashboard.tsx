import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PresupuestoList from '../components/presupuestos/PresupuestoList';
import AdminPanel from '../components/admin/AdminPanel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'presupuestos' | 'clientes' | 'configuracion'>('dashboard');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = [
    { name: 'Clientes Totales', value: '0', icon: Users, color: 'bg-blue-500' },
    { name: 'Presupuestos Activos', value: '0', icon: FileText, color: 'bg-green-500' },
    { name: 'Presupuestos Pendientes', value: '0', icon: FileText, color: 'bg-yellow-500' },
    { name: 'Configuración', value: 'Global', icon: Settings, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg hidden md:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 bg-red-600">
            <span className="text-white text-xl font-bold uppercase tracking-wider">
              Presupuestos
            </span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('clientes')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeView === 'clientes' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Clientes
            </button>
            <button
              onClick={() => setActiveView('presupuestos')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeView === 'presupuestos' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Presupuestos
            </button>
            <button
              onClick={() => setActiveView('configuracion')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeView === 'configuracion' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Configuración
            </button>
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {user.name || 'Usuario'}</h1>
            <p className="text-gray-600">Resumen general del sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h2>
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No hay actividad reciente para mostrar</p>
              </div>
            </div>
          </>
        )}

        {activeView === 'presupuestos' && <PresupuestoList />}
        {activeView === 'configuracion' && <AdminPanel />}
        {activeView === 'clientes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Gestión de Clientes</h2>
            <p className="text-gray-600">Sección de clientes en desarrollo...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
