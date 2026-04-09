import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Custom packages
import { DefaultContainerComponent } from './modules/_layout'

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DefaultContainerComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
          },
          {
            path: 'about',
            loadChildren: () => import('./modules/about/about.module').then(m => m.AboutModule)
          },
          {
            path: 'service',
            loadChildren: () => import('./modules/service/service.module').then(m => m.ServiceModule)
          },
          {
            path: '**',
            redirectTo: '',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    onSameUrlNavigation: 'reload',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
