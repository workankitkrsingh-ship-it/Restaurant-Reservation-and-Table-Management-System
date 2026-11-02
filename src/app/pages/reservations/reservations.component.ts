import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { ReservationStatus } from '../../models/restaurant.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnInit {
  restaurantService = inject(RestaurantService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Booking Form State (Two-way data binding with [(ngModel)])
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  selectedTableId = '';
  reservationDate = new Date().toISOString().split('T')[0];
  timeSlot = '19:00';
  guests = 2;
  specialRequests = '';

  // Filter & Search State
  statusFilter = signal<string>('All');
  searchQuery = signal<string>('');

  feedbackMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  submitting = signal<boolean>(false);

  readonly timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  // Dynamic array filtering using .filter() and .map()
  suitableTables = computed(() =>
    this.restaurantService
      .tables()
      .filter((t) => t.status !== 'Maintenance' && t.capacity >= this.guests)
  );

  filteredReservations = computed(() => {
    const status = this.statusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return this.restaurantService
      .reservations()
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => {
        if (!query) return true;
        return (
          r.customerName.toLowerCase().includes(query) ||
          r.customerEmail.toLowerCase().includes(query) ||
          r.date.includes(query) ||
          String(r.table?.tableNumber || '').includes(query)
        );
      });
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.customerName = user.name;
      this.customerEmail = user.email;
      this.customerPhone = user.phone || '';
    }

    this.restaurantService.fetchTables().subscribe(() => {
      const preselected = this.route.snapshot.queryParamMap.get('tableId');
      if (preselected) {
        this.selectedTableId = preselected;
      } else if (this.suitableTables().length > 0) {
        this.selectedTableId = this.suitableTables()[0]._id;
      }
    });

    this.restaurantService.fetchReservations().subscribe();
  }

  onGuestCountChange(): void {
    const valid = this.suitableTables().some((t) => t._id === this.selectedTableId);
    if (!valid && this.suitableTables().length > 0) {
      this.selectedTableId = this.suitableTables()[0]._id;
    }
  }

  onCreateReservation(): void {
    if (!this.selectedTableId || !this.reservationDate || !this.timeSlot) {
      this.feedbackMessage.set({
        type: 'error',
        text: 'Please select a table, date, and dining time slot.',
      });
      return;
    }

    this.submitting.set(true);
    this.feedbackMessage.set(null);

    this.restaurantService
      .createReservation({
        customerName: this.customerName,
        customerEmail: this.customerEmail,
        customerPhone: this.customerPhone,
        tableId: this.selectedTableId,
        date: this.reservationDate,
        timeSlot: this.timeSlot,
        guests: Number(this.guests),
        specialRequests: this.specialRequests,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.feedbackMessage.set({
            type: 'success',
            text: res.message || 'Table reservation confirmed!',
          });
          this.specialRequests = '';
        },
        error: (err) => {
          this.submitting.set(false);
          this.feedbackMessage.set({
            type: 'error',
            text: err.error?.message || 'Could not complete reservation.',
          });
        },
      });
  }

  onChangeStatus(id: string, status: ReservationStatus): void {
    this.restaurantService.updateReservationStatus(id, status).subscribe({
      next: () => {
        this.feedbackMessage.set({
          type: 'success',
          text: `Reservation status updated to ${status}.`,
        });
      },
    });
  }

  onDeleteReservation(id: string): void {
    if (!confirm('Are you sure you want to remove this reservation record?')) return;
    this.restaurantService.deleteReservation(id).subscribe();
  }
}
