export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'driver' | 'passenger';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}