import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment as env } from '../environments/environment';

// Custom packages
import { StatesModule } from '@core/+states';
import {
  AppEnvHelper,
  HttpRequestInterceptor, HttpResponseInterceptor, JWTAuthInterceptor,
  SharedModule
} from '@core/shared';

const CUST_MODULES = [SharedModule, StatesModule];

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ...CUST_MODULES
  ],
  providers: [
    AppEnvHelper.getValueProvider(env),
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpResponseInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JWTAuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
