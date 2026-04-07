import React, { useState, useEffect } from 'react';
import * as api from '../../utils/api';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { TrashIcon, PlusIcon } from 'lucide-react';

const ConfigGlobalCRUD: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchConfig = async () => {
    try {
      const data = await api.getConfigGlobal();
      setConfig(data[0] || data); // Manejar si viene como array o objeto único
    } catch (error) {
      console.error("Error al cargar config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (config._id) {
        await api.updateConfigGlobal(config._id, config);
      } else {
        await api.createConfigGlobal(config);
      }
      setNotification({ message: 'Configuración guardada con éxito', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Error al guardar configuración', type: 'error' });
    }
  };

  const handleNestedChange = (arrayName: string, index: number, field: string, value: any) => {
    const newArray = [...config[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setConfig({ ...config, [arrayName]: newArray });
  };

  const addNestedItem = (arrayName: string, defaultObj: any) => {
    setConfig({ ...config, [arrayName]: [...config[arrayName], defaultObj] });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Configuración Global del Sistema</h2>
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Margen de Utilidad Sugerido (0-1)</label>
            <input
              type="number" step="0.01"
              value={config?.margenUtilidadSugerido || 0}
              onChange={(e) => setConfig({...config, margenUtilidadSugerido: parseFloat(e.target.value)})}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IVA (%)</label>
            <input
              type="number" step="0.01"
              value={config?.impuestoIVA || 0}
              onChange={(e) => setConfig({...config, impuestoIVA: parseFloat(e.target.value)})}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
        </div>

        {/* Factores de Volumen */}
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Factores por Volumen de Pedido</h3>
          {config?.factoresVolumen?.map((f: any, i: number) => (
            <div key={i} className="flex items-center space-x-2 mb-2">
              <input placeholder="Min" type="number" value={f.min} onChange={(e) => handleNestedChange('factoresVolumen', i, 'min', parseInt(e.target.value))} className="w-20 border rounded p-1"/>
              <input placeholder="Max" type="number" value={f.max} onChange={(e) => handleNestedChange('factoresVolumen', i, 'max', parseInt(e.target.value))} className="w-20 border rounded p-1"/>
              <input placeholder="Factor" type="number" step="0.01" value={f.factor} onChange={(e) => handleNestedChange('factoresVolumen', i, 'factor', parseFloat(e.target.value))} className="w-24 border rounded p-1"/>
              <button type="button" onClick={() => setConfig({...config, factoresVolumen: config.factoresVolumen.filter((_:any, idx:number) => idx !== i)})} className="text-red-500"><TrashIcon size={18}/></button>
            </div>
          ))}
          <button type="button" onClick={() => addNestedItem('factoresVolumen', {min: 0, max: 0, factor: 1})} className="text-blue-600 text-sm flex items-center mt-2"><PlusIcon size={14}/> Añadir Rango</button>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700">
            Guardar Cambios Globales
          </button>
        </div>
      </form>

      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type as any}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default ConfigGlobalCRUD;
