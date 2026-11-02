import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { TableCardComponent } from '../../components/table-card/table-card.component';
import { RestaurantTable, TableLocation, TableStatus } from '../../models/restaurant.model';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, TableCardComponent],
  templateUrl: './tables.component.html',
})
export class TablesComponent implements OnInit {
  restaurantService = inject(RestaurantService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Filters
  selectedZone = signal<string>('All');
  selectedStatus = signal<string>('All');
  minCapacity = signal<number>(1);

  // Admin New Table Form State
  newTableNumber = 109;
  newCapacity = 4;
  newLocation: TableLocation = 'Indoor';
  newFeatures = '';

  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Array Filtering using .filter()
  filteredTables = computed(() => {
    const zone = this.selectedZone();
    const status = this.selectedStatus();
    const minCap = this.minCapacity();

    return this.restaurantService
      .tables()
      .filter((t) => (zone === 'All' ? true : t.location === zone))
      .filter((t) => (status === 'All' ? true : t.status === status))
      .filter((t) => t.capacity >= minCap);
  });

  ngOnInit(): void {
    this.restaurantService.fetchTables().subscribe((res) => {
      if (res.tables && res.tables.length > 0) {
        const maxNum = Math.max(...res.tables.map((t) => t.tableNumber));
        this.newTableNumber = maxNum + 1;
      }
    });
  }

  onAddTable(): void {
    const featuresArray = this.newFeatures
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    this.restaurantService
      .createTable({
        tableNumber: Number(this.newTableNumber),
        capacity: Number(this.newCapacity),
        location: this.newLocation,
        status: 'Available',
        features: featuresArray,
      })
      .subscribe({
        next: (res) => {
          this.feedback.set({
            type: 'success',
            text: `Table #${res.table.tableNumber} added to floor plan!`,
          });
          this.newTableNumber = res.table.tableNumber + 1;
          this.newFeatures = '';
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err.error?.message || 'Failed to add table.',
          });
        },
      });
  }

  onStatusChange(event: { tableId: string; status: TableStatus }): void {
    this.restaurantService.updateTable(event.tableId, { status: event.status }).subscribe({
      next: (res) => {
        this.feedback.set({
          type: 'success',
          text: `Table #${res.table.tableNumber} status updated to ${res.table.status}.`,
        });
      },
    });
  }

  onDeleteTable(tableId: string): void {
    if (!confirm('Remove this table from the restaurant floor plan?')) return;
    this.restaurantService.deleteTable(tableId).subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: 'Table deleted from floor plan.',
        });
      },
    });
  }

  onReserveTable(table: RestaurantTable): void {
    this.router.navigate(['/reservations'], { queryParams: { tableId: table._id } });
  }
}
