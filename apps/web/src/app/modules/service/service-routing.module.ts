import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { environment as env } from '../../../environments/environment';
// import { DefaultComponent } from './pages';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
