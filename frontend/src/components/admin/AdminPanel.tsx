import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserCRUD from './UserCRUD';
import ClientCRUD from './ClientCRUD';
import TelaCRUD from './TelaCRUD';
import DisenoModeloCRUD from './DisenoModeloCRUD';
import TipoCorteCRUD from './TipoCorteCRUD';
import PersonalizacionCRUD from './PersonalizacionCRUD';
import AcabadoEspecialCRUD from './AcabadoEspecialCRUD';
import ConfigGlobalCRUD from './ConfigGlobalCRUD';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const getVisibleTabs = () => {
    const tabs = [
      { id: 'users', label: 'Usuarios', roles: ['admin'] },
      { id: 'clients', label: 'Clientes', roles: ['admin', 'gerente', 'asesor'] },
      { id: 'telas', label: 'Telas', roles: ['admin', 'gerente'] },
      { id: 'disenoModelos', label: 'Diseños/Modelos', roles: ['admin', 'gerente'] },
      { id: 'tiposCorte', label: 'Tipos de Corte', roles: ['admin', 'gerente'] },
      { id: 'personalizaciones', label: 'Personalizaciones', roles: ['admin', 'gerente'] },
      { id: 'acabadosEspeciales', label: 'Acabados Especiales', roles: ['admin', 'gerente'] },
      { id: 'configGlobal', label: 'Configuración Global', roles: ['admin'] },
    ];

    if (!user) return [];

    return tabs.filter(tab => tab.roles.some(role => user.rol === role));
  };

  const visibleTabs = getVisibleTabs();

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [user, visibleTabs, activeTab]);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Panel de Administración</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'users' && <UserCRUD />}
        {activeTab === 'clients' && <ClientCRUD />}
        {activeTab === 'telas' && <TelaCRUD />}
        {activeTab === 'disenoModelos' && <DisenoModeloCRUD />}
        {activeTab === 'tiposCorte' && <TipoCorteCRUD />}
        {activeTab === 'personalizaciones' && <PersonalizacionCRUD />}
        {activeTab === 'acabadosEspeciales' && <AcabadoEspecialCRUD />}
        {activeTab === 'configGlobal' && <ConfigGlobalCRUD />}
      </div>
    </div>
  );
};

export default AdminPanel;
