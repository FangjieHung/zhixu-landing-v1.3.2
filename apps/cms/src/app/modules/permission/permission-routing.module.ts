import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Custom packages
import {
  AppAdminListComponent,
  AppRoleListComponent,
  AppRoleAssignComponent,
} from './pages';

const routes: Routes = [
  {
    path: 'admin/list',
    component: AppAdminListComponent
  },
  {
    path: 'role/list',
    component: AppRoleListComponent
  },
  {
    path: 'role/assign',
    component: AppRoleAssignComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionRoutingModule { }
