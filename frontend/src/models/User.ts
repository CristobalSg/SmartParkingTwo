export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}