import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment as env } from '../../../environments/environment';

// Custom packages
import { DefaultComponent } from './pages';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    data: {
      title: `${env.siteName}｜中科 4 房｜水湳高樓層高級住宅`,
      description: '台中水湳重劃區的高端純自住建案，中科菁英與工程師隱富聚落。',
      url: `${env.siteServer}/`,
      image: `${env.siteServer}/assets/image/og/chuhung-og.png`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
