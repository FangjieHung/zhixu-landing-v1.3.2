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
      title: `${env.siteName}｜老菜脯滴雞精．職人手藝傳承`,
      description: '蘊和堂｜傳承職人手藝的老菜脯滴雞精，無毒契作白蘿蔔、陶甕地下窖藏。',
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
