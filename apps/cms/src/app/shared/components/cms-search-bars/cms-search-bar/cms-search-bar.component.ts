import { Component, Input, Output, EventEmitter } from '@angular/core';

// Custom packages
import { QueryRequestBase } from '@core/models';

@Component({
  selector: 'cms-search-bar',
  templateUrl: './cms-search-bar.component.html',
  styleUrls: ['./cms-search-bar.component.scss']
})
export class CmsSearchBarComponent {
  // IOs
  @Input() hideTextInput = false;
  @Input() queryRequest: QueryRequestBase = new QueryRequestBase();
  @Output() doSearch = new EventEmitter();

  onSearch() {
    this.doSearch.emit();
  }
}
