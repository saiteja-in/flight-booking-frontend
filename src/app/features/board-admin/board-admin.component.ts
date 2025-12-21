import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateFlightComponent } from '../admin/create-flight/create-flight.component';
import { CreateScheduleComponent } from '../admin/create-schedule/create-schedule.component';

@Component({
  selector: 'app-board-admin',
  standalone: true,
  imports: [CommonModule, CreateFlightComponent, CreateScheduleComponent],
  templateUrl: './board-admin.component.html',
})
export class BoardAdminComponent {
  activeTab = signal<'flight' | 'schedule'>('flight');

  setActiveTab(tab: 'flight' | 'schedule') {
    this.activeTab.set(tab);
  }
}


