import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register.component';

export const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'login',component:Login},
  {path:'register',component:RegisterComponent},
  {path:'',redirectTo:'home',pathMatch:'full'}
];
