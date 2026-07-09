import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

// Custom packages
import { SharedModule } from '../../shared/shared.module';
import { DefaultComponent } from './pages';
import { GeoMapComponent } from './components/geo-map/geo-map.component';
import { BookingThanksComponent } from './components/booking-thanks/booking-thanks.component';
import { PrivacyPolicyDialogComponent } from './components/privacy-policy-dialog/privacy-policy-dialog.component';

const CUSTOM_MODULES = [SharedModule];
const CUSTOM_COMPONENTS = [
  DefaultComponent,
  GeoMapComponent,
  BookingThanksComponent,
  PrivacyPolicyDialogComponent,
];

@NgModule({
  declarations: [...CUSTOM_COMPONENTS],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ...CUSTOM_MODULES
  ]
})
export class HomeModule { }
