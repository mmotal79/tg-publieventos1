import React, { useState, useEffect } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface FormField {
  label: string;
  type: string;
  required: boolean;
}

interface GenericCrudTableProps {
  title: string;
  columns: Column[];
  fetchData: () => Promise<any[]>;
  createItem: (data: any) => Promise<any>;
  updateItem: (id: string, data: any) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  formFields: { [key: string]: FormField };
}

const GenericCrudTable: React.FC<GenericCrudTableProps> = ({
  title,
  columns,
  fetchData,
  createItem,
  updateItem,
  deleteItem,
  formFields,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchData();
        setData(result);
        setError(null);
      } catch (err) {
        console.error(`Error al cargar ${title.toLowerCase()}:`, err);
        setError(`Error al cargar ${title.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchData, title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setFormData(item ? item : {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData);
        setData(data.map(item => item._id === editingItem._id ? { ...item, ...formData } : item));
      } else {
        const newItem = await createItem(formData);
        setData([...data, newItem]);
      }
      closeModal();
    } catch (err) {
      console.error(`Error al guardar ${title.toLowerCase()}:`, err);
      setError(`Error al guardar ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar este ${title.toLowerCase().slice(0, -1)}?`)) {
      setLoading(true);
      try {
        await deleteItem(id);
        setData(data.filter((item) => item._id !== id));
        setError(null);
      } catch (err) {
        console.error(`Error al eliminar ${title.toLowerCase().slice(0, -1)}:`, err);
        setError(`Error al eliminar ${title.toLowerCase().slice(0, -1)}.`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !data.length) {
    return <div className="p-6 text-center text-gray-600">Cargando {title.toLowerCase()}...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Añadir Nuevo
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-600">No hay {title.toLowerCase()} para mostrar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 bg-gray-50">
                    {col.label}
                  </th>
                ))}
                <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-700 bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={`${item._id}-${col.key}`} className="py-2 px-4 border-b text-gray-800">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Editar' : 'Añadir Nuevo'} {title.toLowerCase().slice(0, -1)}</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              {Object.keys(formFields).map((key) => (
                <div key={key} className="mb-4">
                  <label htmlFor={key} className="block text-gray-700 text-sm font-bold mb-2">
                    {formFields[key].label}:
                  </label>
                  {formFields[key].type === 'textarea' ? (
                    <textarea
                      id={key}
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      required={formFields[key].required}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  ) : (
                    <input
                      type={formFields[key].type}
                      id={key}
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      required={formFields[key].required}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericCrudTable;
