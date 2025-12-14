import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private storageService = inject(StorageService);
  currentUser = computed(() => this.storageService.getUser());

  ngOnInit(): void {
    // Component is reactive through computed signal
  }
}


