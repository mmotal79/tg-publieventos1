import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  catalogs: any;
  isLoading: boolean;
  error: string | null;
  refetchCatalog: (catalogName: string) => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [catalogs, setCatalogs] = useState({
    telas: [],
    disenoModelos: [],
    tiposCorte: [],
    personalizaciones: [],
    acabadosEspeciales: [],
    clientes: [],
    users: [],
    configGlobal: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      if (authLoading || !user) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [
          telas,
          disenoModelos,
          tiposCorte,
          personalizaciones,
          acabadosEspeciales,
          clientes,
          users,
          configGlobal
        ] = await Promise.all([
          api.getTelas(),
          api.getEntities('catalogos/disenosmodelos'),
          api.getEntities('catalogos/tiposcorte'),
          api.getEntities('catalogos/personalizaciones'),
          api.getEntities('catalogos/acabadosespeciales'),
          api.getClientes(),
          api.getEntities('users'),
          api.getConfigGlobal()
        ]);

        setCatalogs({
          telas,
          disenoModelos,
          tiposCorte,
          personalizaciones,
          acabadosEspeciales,
          clientes,
          users,
          configGlobal
        });
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
        setError("No se pudieron cargar los datos de los catálogos. Por favor, intente de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogs();
  }, [user, authLoading]);

  const refetchCatalog = async (catalogName: string) => {
    setError(null);
    try {
      let data;
      switch (catalogName) {
        case 'telas':
          data = await api.getTelas();
          break;
        case 'disenoModelos':
          data = await api.getEntities('catalogos/disenosmodelos');
          break;
        case 'tiposCorte':
          data = await api.getEntities('catalogos/tiposcorte');
          break;
        case 'personalizaciones':
          data = await api.getEntities('catalogos/personalizaciones');
          break;
        case 'acabadosEspeciales':
          data = await api.getEntities('catalogos/acabadosespeciales');
          break;
        case 'clientes':
          data = await api.getClientes();
          break;
        case 'users':
          data = await api.getEntities('users');
          break;
        case 'configGlobal':
          data = await api.getConfigGlobal();
          break;
        default:
          throw new Error(`Catálogo desconocido: ${catalogName}`);
      }
      setCatalogs(prev => ({ ...prev, [catalogName]: data }));
      return data;
    } catch (err) {
      console.error(`Error al recargar ${catalogName}:`, err);
      setError(`No se pudo recargar el catálogo de ${catalogName}.`);
      throw err;
    }
  };

  const value = {
    catalogs,
    isLoading,
    error,
    refetchCatalog
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};
