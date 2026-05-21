import { Component, Injector, OnInit } from '@angular/core';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import { AppAdminEditComponent } from '../app-admin-edit/app-admin-edit.component';
import {
  PagingRequest,
  PagingResponse,
  AppAdminView,
  AppAdminReq,
} from '@core/models';
import { AppUserApiServ, SharedFuncServ } from '@core/services';

@Component({
  selector: 'cms-app-admin-list',
  templateUrl: './app-admin-list.component.html',
  styleUrls: ['./app-admin-list.component.scss'],
})
export class AppAdminListComponent extends BBDBaseComponent implements OnInit {
  readonly actionName = '管理者';
  dataLoading = false;
  dataSource: AppAdminView[] = [];
  request = new PagingRequest<AppAdminReq>();
  response: PagingResponse<AppAdminView> | null = null;
  // corpOpts: CorpView[] = [];

  dispCols = [
    '狀態', '帳號', '名稱',
    '啟用日期', '停用日期',
    '行動電話', '電子信箱'
  ];

  constructor(
    public appUserApiServ: AppUserApiServ,
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
    this.request.queryRequest = new AppAdminReq();
    this.doParamsReset();
  }

  doParamsReset(): void {
    this.response = null;
    this.dataSource = [];
  }

  doEdit(id = 0): void {
    this.modalServ.create({
      nzTitle: id === 0 ? `新增${this.actionName}` : `編輯${this.actionName}`,
      nzMaskClosable: false,
      nzStyle: { 'max-width': '800px' },
      nzCentered: true,
      nzWidth: '95%',
      nzContent: AppAdminEditComponent,
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

  onDisable(appUserId: number): void {
    this.modalServ.confirm({
      nzTitle: `確定要停用此${this.actionName}？`,
      nzContent: `停用後，該${this.actionName}將無法登入系統！`,
      nzCancelText: '取消',
      nzOkText: '確定',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.appUserApiServ.disableAppUser(appUserId).subscribe({
          next: (res) => {
            if (res) {
              this.bbdNotifyServ.success('停用成功');
              this.onSearch();
            } else {
              this.bbdNotifyServ.error('停用失敗');
            }
          },
          error: (err) => {
            this.bbdNotifyServ.error('執行失敗', err);
          }
        });
      }
    })
  }

  onEnable(appUserId: number): void {
    this.modalServ.confirm({
      nzTitle: `確定要啟用此${this.actionName}？`,
      nzContent: `啟用後，該${this.actionName}將可恢復登入系統使用！`,
      nzCancelText: '取消',
      nzOkText: '確定',
      nzOnOk: () => {
        this.appUserApiServ.enableAppUser(appUserId).subscribe({
          next: (res) => {
            if (res) {
              this.bbdNotifyServ.success('啟用成功');
              this.onSearch();
            } else {
              this.bbdNotifyServ.error('啟用失敗');
            }
          },
          error: (err) => {
            this.bbdNotifyServ.error('執行失敗', err);
          }
        });
      }
    })
  }

  onSearch(pageIndex = 1): void {
    this.request.pageIndex = pageIndex;
    this.doParamsReset();
    this.dataLoading = true;
    this.sharedFuncServ.doQueryTimeOptimize<AppAdminReq>(this.request.queryRequest);
    this.appUserApiServ.getAppAdminViewsPaging(this.request).subscribe({
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

}
