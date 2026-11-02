export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export type TableLocation = 'Indoor' | 'Outdoor Patio' | 'Window Side' | 'Private Lounge';
export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Maintenance';

export interface RestaurantTable {
  _id: string;
  tableNumber: number;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  features: string[];
  createdAt?: string;
}

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Seated' | 'Completed' | 'Cancelled';

export interface Reservation {
  _id: string;
  user?: User | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  table: RestaurantTable;
  date: string;
  timeSlot: string;
  guests: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt?: string;
}
