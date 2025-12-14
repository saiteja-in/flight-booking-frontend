import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-board-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-user.component.html',
})
export class BoardUserComponent implements OnInit {
  private userService = inject(UserService);
  content = signal<string>('');

  ngOnInit(): void {
    this.userService.getUserBoard().subscribe({
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


