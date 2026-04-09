import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRoutingModule } from './service-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DefaultComponent } from './pages';

@NgModule({
  declarations: [DefaultComponent],
  imports: [
    CommonModule,
    ServiceRoutingModule,
    SharedModule
  ]
})
export class ServiceModule { }
