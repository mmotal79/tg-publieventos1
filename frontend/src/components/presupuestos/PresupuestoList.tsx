import React, { useState, useEffect } from 'react';
import * as api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Notification from '../common/Notification';
import ConfirmationModal from '../common/ConfirmationModal';
import PresupuestoForm from './PresupuestoForm';
import PresupuestoPDF from './PresupuestoPDF';

const PresupuestoList: React.FC = () => {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPresupuestos = async () => {
    setLoading(true);
    try {
      const data = await api.getPresupuestos({});
      setPresupuestos(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar presupuestos:", err);
      setError("No se pudieron cargar los presupuestos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deletePresupuesto(deletingId);
      setNotification({ message: "Presupuesto eliminado correctamente.", type: 'success' });
      fetchPresupuestos();
    } catch (err) {
      console.error("Error al eliminar presupuesto:", err);
      setNotification({ message: "Error al eliminar el presupuesto.", type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setEditingId(null);
    fetchPresupuestos();
  };

  if (isFormOpen) {
    return (
      <PresupuestoForm
        presupuestoId={editingId}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setEditingId(null); }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Presupuestos</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      ) : presupuestos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-10 rounded-lg text-center">
          No hay presupuestos registrados aún. ¡Crea el primero!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presupuestos.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{p.cliente?.nombre || 'Cliente Desconocido'}</h3>
                  <p className="text-sm text-gray-500">{formatDate(p.createdAt)}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {p.estado || 'Borrador'}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Total del Presupuesto:</p>
                <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(p.total)}</p>
              </div>

              <div className="flex justify-between space-x-2">
                <PresupuestoPDF presupuesto={p} />
                <button
                  onClick={() => handleEdit(p._id)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-2 rounded-md transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeletingId(p._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 rounded-md transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar Presupuesto"
        message="¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
      />

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

export default PresupuestoList;
