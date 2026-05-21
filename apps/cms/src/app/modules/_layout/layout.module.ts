import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Custom packages
import { AntdModule, SharedModule } from '@core/shared';
import { DefaultContainerComponent, HeaderComponent, SidebarComponent } from './pages';

const CUSTOM_MODULES = [AntdModule, SharedModule];
const CUSTOM_COMPONENTS = [DefaultContainerComponent, HeaderComponent, SidebarComponent];

@NgModule({
  declarations: [
    ...CUSTOM_COMPONENTS
  ],
  imports: [
    CommonModule,
    RouterModule,
    ...CUSTOM_MODULES
  ]
})
export class LayoutModule { }
