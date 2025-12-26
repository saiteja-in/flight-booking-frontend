import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { BoardAdminComponent } from './features/board-admin/board-admin.component';
import { roleGuard } from './core/guards/role.guard';
import { SearchComponent } from './features/search/search.component';
import { BookingComponent } from './features/booking/booking.component';
import { BookingsComponent } from './features/my-bookings/bookings.component';
import { TicketComponent } from './features/ticket/ticket.component';

export const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'login',component:Login},
  {path:'oauth2/callback',component:Login},
  {path:'register',component:RegisterComponent},
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchComponent },
  { path: 'booking/:scheduleId', component: BookingComponent, canActivate: [authGuard] },
  { path: 'bookings', component: BookingsComponent, canActivate: [authGuard] },
  { path: 'ticket/:ticketId', component: TicketComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: BoardAdminComponent,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
  },
  {path:'',redirectTo:'home',pathMatch:'full'}
];
