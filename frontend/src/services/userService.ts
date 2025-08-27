import { User } from '../models';
import { userAdapter } from '../adapters/userAdapter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const userService = {
  // Obtener todos los usuarios
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    return userAdapter.fromApiArray(data);
  },

  // Crear un nuevo usuario
  createUser: async (email: string, name: string): Promise<User> => {
    const userData = userAdapter.toCreateRequest(email, name);
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    return userAdapter.fromApi(data);
  },

  // Obtener usuario por ID
  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`);
    const data = await response.json();
    return userAdapter.fromApi(data);
  }
};