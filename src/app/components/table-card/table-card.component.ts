import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantTable, TableStatus } from '../../models/restaurant.model';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-card.component.html',
})
export class TableCardComponent {
  @Input({ required: true }) table!: RestaurantTable;
  @Input() isAdmin: boolean = false;
  @Input() showReserveButton: boolean = true;

  @Output() selectForBooking = new EventEmitter<RestaurantTable>();
  @Output() statusChange = new EventEmitter<{ tableId: string; status: TableStatus }>();
  @Output() deleteTable = new EventEmitter<string>();

  onBookClick(): void {
    this.selectForBooking.emit(this.table);
  }

  onStatusChange(newStatus: TableStatus): void {
    this.statusChange.emit({ tableId: this.table._id, status: newStatus });
  }

  onDeleteClick(): void {
    this.deleteTable.emit(this.table._id);
  }

  getStatusBadgeClass(status: TableStatus): string {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100/80 text-emerald-800 border-emerald-300';
      case 'Reserved':
        return 'bg-sky-100/80 text-sky-800 border-sky-300';
      case 'Occupied':
        return 'bg-amber-100/80 text-amber-900 border-amber-300';
      case 'Maintenance':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getTopAccentClass(status: TableStatus): string {
    switch (status) {
      case 'Available':
        return 'border-t-4 border-t-emerald-600';
      case 'Reserved':
        return 'border-t-4 border-t-sky-600';
      case 'Occupied':
        return 'border-t-4 border-t-amber-600';
      case 'Maintenance':
        return 'border-t-4 border-t-slate-400';
      default:
        return '';
    }
  }
}
