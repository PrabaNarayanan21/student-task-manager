import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard }
from './features/tasks/dashboard/dashboard';
import { TaskForm } from './features/tasks/task-form/task-form';
import { authGuard } from './core/guards/auth-guard';
import { Calendar } from './features/tasks/calendar/calendar'; // 👈 add

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },
  {
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard]
},
{ path: 'tasks/create', 
  component: TaskForm,
  canActivate: [authGuard]
},
  
{ 
  path: 'tasks/edit/:id',
  component: TaskForm,
  canActivate: [authGuard]
},
  { 
    path: 'calendar', 
    component: Calendar, 
    canActivate: [authGuard] } 

];