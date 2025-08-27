import { User, CreateUserRequest } from '../models';

export const userAdapter = {
  // Convierte datos de la API al modelo del frontend
  fromApi: (apiData: any): User => ({
    id: apiData.id,
    email: apiData.email,
    name: apiData.full_name || apiData.name,
    createdAt: new Date(apiData.created_at)
  }),

  // Convierte datos del frontend para enviar a la API
  toCreateRequest: (email: string, name: string): CreateUserRequest => ({
    email: email.toLowerCase().trim(),
    name: name.trim()
  }),

  // Convierte array de datos de la API
  fromApiArray: (apiArray: any[]): User[] => {
    return apiArray.map(item => userAdapter.fromApi(item));
  }
};