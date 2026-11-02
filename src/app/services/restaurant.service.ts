import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RestaurantTable, Reservation, ReservationStatus } from '../models/restaurant.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private readonly apiBase = 'http://localhost:5000/api';

  // State Management using Signals & Array Operations
  tables = signal<RestaurantTable[]>([]);
  reservations = signal<Reservation[]>([]);
  loading = signal<boolean>(false);

  // Derived metrics using JavaScript array operations (.filter, .map, .reduce)
  availableTables = computed(() =>
    this.tables().filter((t) => t.status === 'Available')
  );

  occupiedTablesCount = computed(() =>
    this.tables().filter((t) => t.status === 'Occupied').length
  );

  reservedTablesCount = computed(() =>
    this.tables().filter((t) => t.status === 'Reserved').length
  );

  totalSeatingCapacity = computed(() =>
    this.tables()
      .map((t) => t.capacity)
      .reduce((acc, cap) => acc + cap, 0)
  );

  activeReservationsCount = computed(() =>
    this.reservations().filter(
      (r) => r.status === 'Confirmed' || r.status === 'Seated' || r.status === 'Pending'
    ).length
  );

  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchTables(): Observable<{ success: boolean; tables: RestaurantTable[] }> {
    this.loading.set(true);
    return this.http
      .get<{ success: boolean; tables: RestaurantTable[] }>(`${this.apiBase}/tables`)
      .pipe(
        tap({
          next: (res) => {
            this.tables.set(res.tables || []);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        })
      );
  }

  createTable(tableData: Partial<RestaurantTable>): Observable<{ success: boolean; table: RestaurantTable }> {
    return this.http
      .post<{ success: boolean; table: RestaurantTable }>(`${this.apiBase}/tables`, tableData, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          if (res.table) {
            const updated = [...this.tables(), res.table].sort((a, b) => a.tableNumber - b.tableNumber);
            this.tables.set(updated);
          }
        })
      );
  }

  updateTable(id: string, updates: Partial<RestaurantTable>): Observable<{ success: boolean; table: RestaurantTable }> {
    return this.http
      .put<{ success: boolean; table: RestaurantTable }>(`${this.apiBase}/tables/${id}`, updates, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          if (res.table) {
            // Array .map() operation to update modified table in state
            this.tables.set(
              this.tables().map((t) => (t._id === id ? res.table : t))
            );
          }
        })
      );
  }

  deleteTable(id: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiBase}/tables/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          // Array .filter() operation to remove deleted table
          this.tables.set(this.tables().filter((t) => t._id !== id));
        })
      );
  }

  fetchReservations(): Observable<{ success: boolean; reservations: Reservation[] }> {
    return this.http
      .get<{ success: boolean; reservations: Reservation[] }>(`${this.apiBase}/reservations`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          this.reservations.set(res.reservations || []);
        })
      );
  }

  createReservation(payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tableId: string;
    date: string;
    timeSlot: string;
    guests: number;
    specialRequests?: string;
  }): Observable<{ success: boolean; reservation: Reservation; message: string }> {
    return this.http
      .post<{ success: boolean; reservation: Reservation; message: string }>(
        `${this.apiBase}/reservations`,
        payload,
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(
        tap((res) => {
          if (res.reservation) {
            this.reservations.set([res.reservation, ...this.reservations()]);
            this.fetchTables().subscribe();
          }
        })
      );
  }

  updateReservationStatus(
    id: string,
    status: ReservationStatus
  ): Observable<{ success: boolean; reservation: Reservation }> {
    return this.http
      .patch<{ success: boolean; reservation: Reservation }>(
        `${this.apiBase}/reservations/${id}/status`,
        { status },
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(
        tap((res) => {
          if (res.reservation) {
            this.reservations.set(
              this.reservations().map((r) => (r._id === id ? res.reservation : r))
            );
            this.fetchTables().subscribe();
          }
        })
      );
  }

  deleteReservation(id: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiBase}/reservations/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          this.reservations.set(this.reservations().filter((r) => r._id !== id));
        })
      );
  }
}
