import { Component, Injector, OnInit } from '@angular/core';

// Custom packages
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-default-container',
  templateUrl: './default-container.component.html',
  styleUrls: ['./default-container.component.scss']
})
export class DefaultContainerComponent extends BBDBaseComponent implements OnInit {
  isCollapsed = false;
  visible = false;

  constructor(
    protected override injector: Injector) {
      super(injector);
  }

  ngOnInit(): void {
    this.isCollapsed = false;
    if (this.appAuthApiServ.hasAccessToken) {
      this.storeServ.getCurrAuthUserCache();
    }
  }

  onSidebarCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
