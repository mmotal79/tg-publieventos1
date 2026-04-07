import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../utils/api';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

interface PresupuestoFormProps {
  presupuestoId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const PresupuestoForm: React.FC<PresupuestoFormProps> = ({ presupuestoId, onSave, onCancel }) => {
  const { catalogs, isLoading: catalogsLoading } = useData();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Estado del formulario
  const [formData, setFormData] = useState({
    cliente: '',
    items: [
      {
        disenoModelo: '',
        tela: '',
        tipoCorte: '',
        cantidad: 1,
        personalizaciones: [] as string[],
        acabadosEspeciales: [] as string[],
        precioUnitario: 0,
        subtotal: 0,
      }
    ],
    notas: '',
    validezDias: 15,
    condicionesPago: '50% anticipo, 50% contra entrega',
    total: 0,
  });

  useEffect(() => {
    if (presupuestoId) {
      const fetchPresupuesto = async () => {
        setLoading(true);
        try {
          const data = await api.getPresupuestoById(presupuestoId);
          setFormData({
            cliente: data.cliente._id || data.cliente,
            items: data.items.map((item: any) => ({
              ...item,
              disenoModelo: item.disenoModelo._id || item.disenoModelo,
              tela: item.tela._id || item.tela,
              tipoCorte: item.tipoCorte._id || item.tipoCorte,
              personalizaciones: item.personalizaciones.map((p: any) => p._id || p),
              acabadosEspeciales: item.acabadosEspeciales.map((a: any) => a._id || a),
            })),
            notas: data.notas || '',
            validezDias: data.validezDias || 15,
            condicionesPago: data.condicionesPago || '',
            total: data.total || 0,
          });
        } catch (error) {
          console.error("Error al cargar presupuesto:", error);
          setNotification({ message: "Error al cargar los datos del presupuesto.", type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchPresupuesto();
    }
  }, [presupuestoId]);

  // Cálculos automáticos
  useEffect(() => {
    const calculateTotals = () => {
      let grandTotal = 0;
      const updatedItems = formData.items.map(item => {
        if (!item.disenoModelo || !item.tela || !item.tipoCorte) return { ...item, precioUnitario: 0, subtotal: 0 };

        const diseno = catalogs.disenoModelos.find((d: any) => d._id === item.disenoModelo);
        const tela = catalogs.telas.find((t: any) => t._id === item.tela);
        const corte = catalogs.tiposCorte.find((c: any) => c._id === item.tipoCorte);

        if (!diseno || !tela || !corte) return { ...item, precioUnitario: 0, subtotal: 0 };

        // Lógica de cálculo (Simplificada para el ejemplo)
        let unitPrice = (diseno.consumoTelaPorPrendaMetros * tela.precioPorMetro) + corte.costoPorPrenda;

        item.personalizaciones.forEach(pId => {
          const p = catalogs.personalizaciones.find((pers: any) => pers._id === pId);
          if (p) unitPrice += p.costoAdicionalPorPrenda;
        });

        item.acabadosEspeciales.forEach(aId => {
          const a = catalogs.acabadosEspeciales.find((acab: any) => acab._id === aId);
          if (a) unitPrice += a.costoAdicionalPorPrenda;
        });

        // Aplicar margen de utilidad de la configuración global si existe
        const margin = catalogs.configGlobal?.margenUtilidadSugerido || 0.3;
        unitPrice = unitPrice / (1 - margin);

        const subtotal = unitPrice * item.cantidad;
        grandTotal += subtotal;

        return { ...item, precioUnitario: unitPrice, subtotal };
      });

      setFormData(prev => ({ ...prev, items: updatedItems, total: grandTotal }));
    };

    if (!catalogsLoading) {
      calculateTotals();
    }
  }, [formData.items, catalogs, catalogsLoading]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        disenoModelo: '',
        tela: '',
        tipoCorte: '',
        cantidad: 1,
        personalizaciones: [],
        acabadosEspeciales: [],
        precioUnitario: 0,
        subtotal: 0,
      }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (presupuestoId) {
        await api.updatePresupuesto(presupuestoId, formData);
        setNotification({ message: "Presupuesto actualizado con éxito.", type: 'success' });
      } else {
        await api.createPresupuesto(formData);
        setNotification({ message: "Presupuesto creado con éxito.", type: 'success' });
      }
      setTimeout(onSave, 1500);
    } catch (error: any) {
      setNotification({ message: error.message || "Error al guardar el presupuesto.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (catalogsLoading || loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {presupuestoId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Cliente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un cliente</option>
            {catalogs.clientes.map((c: any) => (
              <option key={c._id} value={c._id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Items */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold border-b pb-2">Prendas / Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Diseño/Modelo</label>
                  <select
                    value={item.disenoModelo}
                    onChange={(e) => handleItemChange(index, 'disenoModelo', e.target.value)}
                    required
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Seleccione...</option>
                    {catalogs.disenoModelos.map((d: any) => (
                      <option key={d._id} value={d._id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Tela</label>
                  <select
                    value={item.tela}
                    onChange={(e) => handleItemChange(index, 'tela', e.target.value)}
                    required
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Seleccione...</option>
                    {catalogs.telas.map((t: any) => (
                      <option key={t._id} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Tipo de Corte</label>
                  <select
                    value={item.tipoCorte}
                    onChange={(e) => handleItemChange(index, 'tipoCorte', e.target.value)}
                    required
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Seleccione...</option>
                    {catalogs.tiposCorte.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    required
                    className="w-full p-2 border rounded-md text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">
                    <strong>Precio Unitario:</strong> {formatCurrency(item.precioUnitario)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 rounded-lg transition-colors"
          >
            + Añadir otra prenda
          </button>
        </div>

        {/* Notas y Condiciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-md"
              placeholder="Observaciones especiales..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones de Pago</label>
            <input
              type="text"
              value={formData.condicionesPago}
              onChange={(e) => setFormData({ ...formData, condicionesPago: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">Validez (Días)</label>
            <input
              type="number"
              value={formData.validezDias}
              onChange={(e) => setFormData({ ...formData, validezDias: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Total y Botones */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6">
          <div className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
            Total: <span className="text-blue-600">{formatCurrency(formData.total)}</span>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 shadow-md transition-all"
            >
              Guardar Presupuesto
            </button>
          </div>
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

export default PresupuestoForm;
