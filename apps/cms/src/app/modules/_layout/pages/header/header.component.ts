import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';

// Custom packages
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BBDBaseComponent implements OnInit {
  // Properties
  visible = false;
  tabs = [
    {
      name: '出貨',
      count: 10,
    },
    {
      name: '補貨',
      count: 300,
    }
  ];

  // IOs
  @Input() isCollapsed = false;
  @Output() doSidebarCollapse = new EventEmitter();

  constructor(
    protected override injector: Injector) {
      super(injector);
  }

  ngOnInit(): void {
    console.log('init header');

    console.log(this.currUserInfo);
    
  }

  onOpenNotifybar(): void {
    this.visible = true;
  }

  onCloseNotifybar(): void {
    this.visible = false;
  }

  onSidebarCollapse(): void {
    this.doSidebarCollapse.emit();
  }

  onSignout(): void {
    this.appAuthApiServ.signout();
  }

}
