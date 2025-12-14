import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-board-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-admin.component.html',
})
export class BoardAdminComponent implements OnInit {
  private userService = inject(UserService);
  content = signal<string>('');

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe({
      next: data => {
        this.content.set(data);
      },
      error: err => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.content.set(res.message);
          } catch {
            this.content.set(`Error with status: ${err.status} - ${err.statusText}`);
          }
        } else {
          this.content.set(`Error with status: ${err.status}`);
        }
      }
    });
  }
}


