import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';

// Custom packages
import { SharedModule } from '../../shared/shared.module';
import { DefaultDashboardComponent } from './pages';

const CUSTOM_MODULES = [SharedModule];
const CUSTOM_COMPONENTS = [DefaultDashboardComponent];

@NgModule({
  declarations: [
    ...CUSTOM_COMPONENTS
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ...CUSTOM_MODULES
  ]
})
export class DashboardModule { }
