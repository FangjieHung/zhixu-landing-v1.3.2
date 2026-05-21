/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import { AuthUserRoute } from '@core/models';

@Component({
  selector: 'cms-page-header',
  templateUrl: './cms-page-header.component.html',
  styleUrls: ['./cms-page-header.component.scss'],
})
export class CmsPageHeaderComponent
  extends BBDBaseComponent
  implements OnDestroy, OnInit
{
  // Injects
  route = inject(ActivatedRoute);
  router = inject(Router);

  // Properties
  lastBreadcrumbName = '';
  lastRouteName = '';
  appRoutes: AuthUserRoute[] = [];
  initTimeout: any = null;
  routerEvents$;

  // IOs
  @Input() breadcrumbs: string[] = [];

  constructor(protected override injector: Injector) {
    super(injector);
    this.routerEvents$ = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this.appAuthApiServ.currUser) {
          this.spinnerServ.show();
          this.initTimeout = setTimeout(() => {
            this.doDataInit(event.url);
            this.spinnerServ.hide();
          }, 500);
        } else {
          this.doDataInit(event.url);
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.breadcrumbs.isUndefinedOrNullOrEmpty() == false) {
      this.lastBreadcrumbName = this.breadcrumbs?.slice(-1)[0] || '';
      this.appRoutes = [];
    }
  }

  ngOnDestroy(): void {
    this.routerEvents$.unsubscribe();
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
  }

  getAppRoutes(appRouteId: number): void {
    if (!appRouteId) {
      return;
    }

    const appRoute = this.appAuthApiServ.currUser?.authUserRoutes?.find(
      (item) => item.id === appRouteId
    );

    if (!appRoute) {
      return;
    }

    this.appRoutes.unshift(appRoute);

    if (appRoute.parentId > 0) {
      this.getAppRoutes(appRoute.parentId);
    }

    if (appRoute.parentId == 0) {
      this.lastRouteName = this.appRoutes?.slice(-1)[0].name || '';
    }
  }

  doDataInit(currUrl: string): void {
    const currRoute = this.appAuthApiServ.currUser?.authUserRoutes?.find(
      (item) => item.path === currUrl
    );
    this.appRoutes = [];
    this.getAppRoutes(currRoute?.id || 0);
  }
}
