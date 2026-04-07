import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getEntities = async (endpoint: string, filters = {}) => {
  try {
    const response = await api.get(`/${endpoint}`, { params: filters });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener entidades de ${endpoint}:`, error);
    throw error;
  }
};

export const getEntityById = async (endpoint: string, id: string) => {
  try {
    const response = await api.get(`/${endpoint}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener entidad ${id} de ${endpoint}:`, error);
    throw error;
  }
};

export const createEntity = async (endpoint: string, data: any) => {
  try {
    const response = await api.post(`/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al crear entidad en ${endpoint}:`, error);
    throw error;
  }
};

export const updateEntity = async (endpoint: string, id: string, data: any) => {
  try {
    const response = await api.put(`/${endpoint}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar entidad ${id} en ${endpoint}:`, error);
    throw error;
  }
};

export const deleteEntity = async (endpoint: string, id: string) => {
  try {
    const response = await api.delete(`/${endpoint}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar entidad ${id} de ${endpoint}:`, error);
    throw error;
  }
};

export const getPresupuestos = (filters: any) => getEntities('presupuestos', filters);
export const getPresupuestoById = (id: string) => getEntityById('presupuestos', id);
export const createPresupuesto = (data: any) => createEntity('presupuestos', data);
export const updatePresupuesto = (id: string, data: any) => updateEntity('presupuestos', id, data);
export const deletePresupuesto = (id: string) => deleteEntity('presupuestos', id);

export const getClientes = (filters?: any) => getEntities('clientes', filters);
export const createCliente = (data: any) => createEntity('clientes', data);
export const updateCliente = (id: string, data: any) => updateEntity('clientes', id, data);
export const deleteCliente = (id: string) => deleteEntity('clientes', id);

export const getTelas = () => getEntities('catalogos/telas');
export const createTela = (data: any) => createEntity('catalogos/telas', data);
export const updateTela = (id: string, data: any) => updateEntity('catalogos/telas', id, data);
export const deleteTela = (id: string) => deleteEntity('catalogos/telas', id);

export const getDisenosModelos = () => getEntities('catalogos/disenosmodelos');
export const createDisenoModelo = (data: any) => createEntity('catalogos/disenosmodelos', data);
export const updateDisenoModelo = (id: string, data: any) => updateEntity('catalogos/disenosmodelos', id, data);
export const deleteDisenoModelo = (id: string) => deleteEntity('catalogos/disenosmodelos', id);

export const getTiposCorte = () => getEntities('catalogos/tiposcorte');
export const createTipoCorte = (data: any) => createEntity('catalogos/tiposcorte', data);
export const updateTipoCorte = (id: string, data: any) => updateEntity('catalogos/tiposcorte', id, data);
export const deleteTipoCorte = (id: string) => deleteEntity('catalogos/tiposcorte', id);

export const getPersonalizaciones = () => getEntities('catalogos/personalizaciones');
export const createPersonalizacion = (data: any) => createEntity('catalogos/personalizaciones', data);
export const updatePersonalizacion = (id: string, data: any) => updateEntity('catalogos/personalizaciones', id, data);
export const deletePersonalizacion = (id: string) => deleteEntity('catalogos/personalizaciones', id);

export const getAcabadosEspeciales = () => getEntities('catalogos/acabadosespeciales');
export const createAcabadoEspecial = (data: any) => createEntity('catalogos/acabadosespeciales', data);
export const updateAcabadoEspecial = (id: string, data: any) => updateEntity('catalogos/acabadosespeciales', id, data);
export const deleteAcabadoEspecial = (id: string) => deleteEntity('catalogos/acabadosespeciales', id);

export const getUsers = (filters: any) => getEntities('users', filters);
export const getUserById = (id: string) => getEntityById('users', id);
export const createUser = (data: any) => createEntity('users', data);
export const updateUser = (id: string, data: any) => updateEntity('users', id, data);
export const deleteUser = (id: string) => deleteEntity('users', id);

export const getConfigGlobal = () => getEntities('config');
export const createConfigGlobal = (data: any) => createEntity('config', data);
export const updateConfigGlobal = (id: string, data: any) => updateEntity('config', id, data);

export const login = async (email: string, password: any) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

export const register = async (userData: any) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
};

export default api;
