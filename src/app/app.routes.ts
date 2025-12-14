import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'login',component:Login},
  {path:'register',component:RegisterComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {path:'',redirectTo:'home',pathMatch:'full'}
];
