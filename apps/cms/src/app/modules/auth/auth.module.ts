import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';

// Custom packages
import { SharedModule } from '@core/shared';
import { SigninComponent } from './pages';

const CUSTOM_MODULES = [SharedModule];
const CUSTOM_COMPONENTS = [SigninComponent];


@NgModule({
  declarations: [
    ...CUSTOM_COMPONENTS
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ...CUSTOM_MODULES
  ]
})
export class AuthModule { }
