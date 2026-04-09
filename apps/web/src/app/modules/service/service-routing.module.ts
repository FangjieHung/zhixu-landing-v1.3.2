import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment as env } from '../../../environments/environment';
import { DefaultComponent } from './pages';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    data: {
      title: `清潔服務｜${env.siteName}`,
      description: '辦公室、居家、園藝、無水洗車，專業清潔服務',
      url: `${env.siteServer}/service`,
      image: `${env.siteServer}/assets/image/og/tslmai.png`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
