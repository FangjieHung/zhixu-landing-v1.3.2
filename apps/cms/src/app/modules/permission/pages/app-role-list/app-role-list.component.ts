import { Component, Injector, OnInit } from '@angular/core';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import {
  PagingRequest,
  PagingResponse,
  AppRoleView,
  AppRoleReq,
} from '@core/models';
import { AppRoleApiServ, SharedDataServ, SharedFuncServ } from '@core/services';
import { AppRoleEditComponent } from '../app-role-edit/app-role-edit.component';

@Component({
  selector: 'cms-role',
  templateUrl: './app-role-list.component.html',
  styleUrls: ['./app-role-list.component.scss'],
})
export class AppRoleListComponent extends BBDBaseComponent implements OnInit {
  readonly actionName = '角色維護';
  dataLoading = false;
  dataSource: AppRoleView[] = [];
  request = new PagingRequest<AppRoleReq>();
  response: PagingResponse<AppRoleView> | null = null;

  dispCols = [
    '平台',
    '角色名稱',
    '狀態',
  ];

  constructor(
    public appRoleApiServ: AppRoleApiServ,
    public sharedDataServ: SharedDataServ,
    private sharedFuncServ: SharedFuncServ,
    protected override injector: Injector,) {
    super(injector);
    this.getCaches();
  }

  ngOnInit(): void {
    this.doParamsInit();
    this.onSearch();
  }

  getCaches(): void {
    // this.spinnerServ.show();
    // forkJoin(
    //   [this.corpApiServ.getCorpViews(new CorpReq()),]
    // ).subscribe(([corpOpts]) => {
    //   this.corpOpts = [...corpOpts || []];
    // }).add(() => this.spinnerServ.hide());
  }

  doParamsInit(): void {
    this.request.queryRequest = new AppRoleReq();
    this.doParamsReset();
  }

  doParamsReset(): void {
    this.response = null;
    this.dataSource = [];
  }

  onSearch(pageIndex = 1): void {
    this.request.pageIndex = pageIndex;
    this.doParamsReset();
    this.dataLoading = true;
    this.sharedFuncServ.doQueryTimeOptimize<AppRoleReq>(this.request.queryRequest);
    this.appRoleApiServ.getAppRoleViewsPaging(this.request).subscribe({
      next: (res) => {
        if (!res || res.rows.isUndefinedOrNullOrEmpty()) {
          this.bbdNotifyServ.success('查無任何資料。');
          return;
        }
        this.response = res;
        this.dataSource = [...this.response.rows];
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
      }
    }).add(() => this.dataLoading = false);
  }

  doEdit(id = 0): void {
    this.modalServ.create({
      nzTitle: id === 0 ? `新增${this.actionName}` : `編輯${this.actionName}`,
      nzMaskClosable: false,
      nzStyle: { 'max-width': '800px' },
      nzCentered: true,
      nzWidth: '95%',
      nzContent: AppRoleEditComponent,
      nzData: {
        id: id,
        // actionName: this.actionName,
      }
    }).afterClose.subscribe(res => {
      if (res) {
        this.onSearch();
      }
    });
  }
}
