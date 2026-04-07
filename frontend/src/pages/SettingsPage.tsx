import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import GenericCrudTable from '../components/common/GenericCrudTable';
import {
  getClientes, createCliente, updateCliente, deleteCliente,
  getTelas, createTela, updateTela, deleteTela,
  getDisenosModelos, createDisenoModelo, updateDisenoModelo, deleteDisenoModelo,
  getTiposCorte, createTipoCorte, updateTipoCorte, deleteTipoCorte,
  getPersonalizaciones, createPersonalizacion, updatePersonalizacion, deletePersonalizacion,
  getAcabadosEspeciales, createAcabadoEspecial, updateAcabadoEspecial, deleteAcabadoEspecial,
  getUsers, createUser, updateUser, deleteUser,
  getConfigGlobal
} from '../utils/api';

const SettingsPage: React.FC = () => {
  const location = useLocation();

  const tablesConfig: { [key: string]: any } = {
    clientes: {
      title: 'Gestión de Clientes',
      fetchData: getClientes,
      createItem: createCliente,
      updateItem: updateCliente,
      deleteItem: deleteCliente,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'direccion', label: 'Dirección' },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        email: { label: 'Email', type: 'email', required: false },
        telefono: { label: 'Teléfono', type: 'text', required: false },
        direccion: { label: 'Dirección', type: 'text', required: false },
      },
    },
    telas: {
      title: 'Gestión de Telas',
      fetchData: getTelas,
      createItem: createTela,
      updateItem: updateTela,
      deleteItem: deleteTela,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'precioPorMetro', label: 'Precio/Metro', render: (value: any) => `$${parseFloat(value).toFixed(2)}` },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        descripcion: { label: 'Descripción', type: 'textarea', required: false },
        precioPorMetro: { label: 'Precio por Metro', type: 'number', required: true },
      },
    },
    disenosmodelos: {
      title: 'Gestión de Diseños/Modelos',
      fetchData: getDisenosModelos,
      createItem: createDisenoModelo,
      updateItem: updateDisenoModelo,
      deleteItem: deleteDisenoModelo,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'consumoTelaPorPrendaMetros', label: 'Consumo Tela (m)', render: (value: any) => parseFloat(value).toFixed(2) },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        descripcion: { label: 'Descripción', type: 'textarea', required: false },
        consumoTelaPorPrendaMetros: { label: 'Consumo de Tela por Prenda (metros)', type: 'number', required: true },
      },
    },
    tiposcorte: {
      title: 'Gestión de Tipos de Corte',
      fetchData: getTiposCorte,
      createItem: createTipoCorte,
      updateItem: updateTipoCorte,
      deleteItem: deleteTipoCorte,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'costoPorPrenda', label: 'Costo/Prenda', render: (value: any) => `$${parseFloat(value).toFixed(2)}` },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        descripcion: { label: 'Descripción', type: 'textarea', required: false },
        costoPorPrenda: { label: 'Costo por Prenda', type: 'number', required: true },
      },
    },
    personalizaciones: {
      title: 'Gestión de Personalizaciones',
      fetchData: getPersonalizaciones,
      createItem: createPersonalizacion,
      updateItem: updatePersonalizacion,
      deleteItem: deletePersonalizacion,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'costoAdicionalPorPrenda', label: 'Costo Adicional/Prenda', render: (value: any) => `$${parseFloat(value).toFixed(2)}` },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        descripcion: { label: 'Descripción', type: 'textarea', required: false },
        costoAdicionalPorPrenda: { label: 'Costo Adicional por Prenda', type: 'number', required: true },
      },
    },
    acabadosespeciales: {
      title: 'Gestión de Acabados Especiales',
      fetchData: getAcabadosEspeciales,
      createItem: createAcabadoEspecial,
      updateItem: updateAcabadoEspecial,
      deleteItem: deleteAcabadoEspecial,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'costoAdicionalPorPrenda', label: 'Costo Adicional/Prenda', render: (value: any) => `$${parseFloat(value).toFixed(2)}` },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        descripcion: { label: 'Descripción', type: 'textarea', required: false },
        costoAdicionalPorPrenda: { label: 'Costo Adicional por Prenda', type: 'number', required: true },
      },
    },
    usuarios: {
      title: 'Gestión de Usuarios',
      fetchData: getUsers,
      createItem: createUser,
      updateItem: updateUser,
      deleteItem: deleteUser,
      columns: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'rol', label: 'Rol' },
      ],
      formFields: {
        nombre: { label: 'Nombre', type: 'text', required: true },
        email: { label: 'Email', type: 'email', required: true },
        password: { label: 'Contraseña', type: 'password', required: true },
        rol: { label: 'Rol', type: 'text', required: true },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ajustes del Sistema</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Configuraciones</h3>
          <ul className="space-y-2">
            {Object.keys(tablesConfig).map((key) => (
              <li key={key}>
                <Link
                  to={`/settings/${key}`}
                  className={`block px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 transition-colors duration-200
                    ${location.pathname === `/settings/${key}` ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                >
                  {tablesConfig[key].title.replace('Gestión de ', '')}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/settings/global"
                className={`block px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 transition-colors duration-200
                  ${location.pathname === '/settings/global' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
              >
                Configuración Global
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:flex-1">
          <Routes>
            <Route path="/" element={
              <div className="p-6 bg-white rounded-lg shadow-md text-gray-700">
                Selecciona una opción del menú para gestionar los datos.
              </div>
            } />

            {Object.entries(tablesConfig).map(([key, config]) => (
              React.createElement(Route, {
                key: key,
                path: `/${key}`,
                element: (
                  <GenericCrudTable
                    title={config.title}
                    columns={config.columns}
                    fetchData={config.fetchData}
                    createItem={config.createItem}
                    updateItem={config.updateItem}
                    deleteItem={config.deleteItem}
                    formFields={config.formFields}
                  />
                )
              })
            ))}

            <Route path="/global" element={
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Configuración Global</h2>
                <p className="text-gray-600">Aquí se gestionarán los parámetros globales del sistema (IVA, márgenes, etc.).</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
