import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionRoutingModule } from './permission-routing.module';

// Thired party packages
import { QuillModule } from 'ngx-quill';

// Custom packages
import { SharedModule } from '../../shared/shared.module';
import {
  AppAdminEditComponent, AppAdminListComponent,
  AppRoleListComponent, AppRoleEditComponent,
  AppRoleAssignComponent,
} from './pages';

const CUST_MODULES = [SharedModule];
const CUST_COMPONENTS = [
  AppAdminEditComponent, AppAdminListComponent,
  AppRoleListComponent, AppRoleEditComponent,
  AppRoleAssignComponent,
];

@NgModule({
  declarations: [
    ...CUST_COMPONENTS
  ],
  imports: [
    CommonModule,
    PermissionRoutingModule,
    QuillModule.forRoot(),
    ...CUST_MODULES
  ]
})
export class PermissionModule { }
