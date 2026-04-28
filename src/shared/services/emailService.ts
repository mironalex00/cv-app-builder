import axios from 'axios';

/**
 * Valida un email llamando a la API del servidor.
 * El servidor se encarga de la sintaxis y del filtrado de dominios desechables.
 */
export const validateEmail = async (email: string): Promise<string | boolean> => {
  if (!email) return 'El email es obligatorio';
  try {
    const response = await axios.post('/api/domains/email', { email });
    return response.data.valid || true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      return String(error.response.data.error);
    }
    return true;
  }
};