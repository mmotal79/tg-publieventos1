import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-xl font-bold text-red-600">
          TG Publieventos
        </Link>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-gray-700">
          <User className="h-5 w-5" />
          <span className="text-sm font-medium">{user.name || 'Usuario'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
