import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';

// Custom packages
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends BBDBaseComponent implements OnInit {
  // IOs
  @Input() isCollapsed = false;

  constructor(
    protected override injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    console.log('init side menu');
  }
}
