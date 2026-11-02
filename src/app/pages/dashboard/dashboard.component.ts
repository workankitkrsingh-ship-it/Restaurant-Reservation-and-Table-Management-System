import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { TableCardComponent } from '../../components/table-card/table-card.component';
import { RestaurantTable, TableStatus } from '../../models/restaurant.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TableCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  restaurantService = inject(RestaurantService);
  authService = inject(AuthService);
  private router = inject(Router);

  selectedLocation = signal<string>('All');

  // Dynamic filtering with JS Array .filter()
  filteredSpotlightTables = computed(() => {
    const loc = this.selectedLocation();
    const list = this.restaurantService.tables();
    if (loc === 'All') {
      return list.slice(0, 4);
    }
    return list.filter((t) => t.location === loc).slice(0, 4);
  });

  // Recent active reservations using .filter() and .slice()
  upcomingReservations = computed(() =>
    this.restaurantService
      .reservations()
      .filter((r) => r.status !== 'Cancelled')
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.restaurantService.fetchTables().subscribe();
    if (this.authService.isAuthenticated()) {
      this.restaurantService.fetchReservations().subscribe();
    }
  }

  onSelectTableForBooking(table: RestaurantTable): void {
    this.router.navigate(['/reservations'], { queryParams: { tableId: table._id } });
  }

  onQuickStatusChange(event: { tableId: string; status: TableStatus }): void {
    this.restaurantService.updateTable(event.tableId, { status: event.status }).subscribe();
  }
}
