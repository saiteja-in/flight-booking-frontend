import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { BoardUserComponent } from './features/board-user/board-user.component';
import { BoardAdminComponent } from './features/board-admin/board-admin.component';
import { roleGuard } from './core/guards/role.guard';
import { SearchComponent } from './features/search/search.component';
import { SampleRoute } from './features/sample-route/sample-route';

export const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'login',component:Login},
  {path:'oauth2/callback',component:Login}, // OAuth2 callback route
  {path:'register',component:RegisterComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'user', component: BoardUserComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchComponent },
  { path: 'sample-route', component: SampleRoute },
  {
    path: 'admin',
    component: BoardAdminComponent,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
  },
  {path:'',redirectTo:'home',pathMatch:'full'}
];
