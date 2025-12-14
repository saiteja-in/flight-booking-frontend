import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { Login } from './features/login/login';
import { Signup } from './features/signup/signup';

export const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'login',component:Login},
  {path:'register',component:Signup},
  {path:'',redirectTo:'home',pathMatch:'full'}
];
