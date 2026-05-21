/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import {
  AppAdminReq,
  AppRoleView, AppUserRoleDto
} from '@core/models';
import { AppRoleApiServ, AppUserApiServ, SharedDataServ } from '@core/services';

@Component({
  selector: 'cms-app-role-assign',
  templateUrl: './app-role-assign.component.html',
  styleUrls: ['./app-role-assign.component.scss']
})

export class AppRoleAssignComponent extends BBDBaseComponent implements OnInit {
  //#region Injects
  public appUserApiServ = inject(AppUserApiServ);
  private _appRoleApiServ = inject(AppRoleApiServ);
  private _sharedDataServ = inject(SharedDataServ);
  private _fb = inject(FormBuilder);

  //#endregion

  //#region Properties
  dataLoading = false;
  // userRoleDtos: AppUserRoleDto[] = [];
  valForm!: UntypedFormGroup;
  listRoleChecked: AppRoleChecked[] = [];
  selected: EmpRole = new EmpRole();
  selectedPfm = '';
  isAdmin = false;

  //#endregion

  //#region Caches
  appPfms$ = this._sharedDataServ.getAppPfms();
  searchOptions$?: Observable<any[]>;

  //#endregion

  //#region IOs & Gets & Sets
  get f(): { [key: string]: AbstractControl } {
    return this.valForm.controls;
  }

  //#endregion

  constructor(
    protected override injector: Injector) {
    super(injector);
    this.doFormInit();
  }

  ngOnInit(): void {
    this.doParamsInit();
  }

  doParamsInit(): void {
    this.selected = new EmpRole();
    this.doParamsReset();
  }

  doParamsReset(): void {
    this.listRoleChecked = [];
    this.selectedPfm = '';
  }

  doDataInit(): void {
    this.storeServ.getAppRolesCache().subscribe({
      next: (res) => {
        if (!res) {
          this.bbdNotifyServ.error('無法取得權限角色資料。');
          return;
        }
        this.listRoleChecked = res;
        this.listRoleChecked.map(item => {
          item.checked = false;
        });

        if (this.selected.userRoleDtos.isUndefinedOrNullOrEmpty()) {
          return;
        }

        this.selected.userRoleDtos.map(item => {
          const roleChecked = this.listRoleChecked.find(role => role.id === item.appRoleId);

          if (roleChecked) {
            roleChecked.checked = true;
          }
        });
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
      }
    });
  }

  doFormInit(): void {
    this.valForm = this._fb.group({
      searchText: [null]
    });

    this.searchOptions$ = this.f['searchText'].valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      switchMap(val => {
        const req = new AppAdminReq();
        req.queryString = val || '';
        req.takeCount = 10;
        this.dataLoading = true;

        return this.appUserApiServ.getAppAdminOptions(req);
      }),
      tap(() => {
        this.dataLoading = false;
      })
    );
  }

  doEmpSelected(val: any): void {
    this.doParamsInit();
    this.isAdmin = (val?.appUserId || 0) === 1;
    this.selected.emp = val;
    this._appRoleApiServ.getAppUserRoleDtosByAppUserId(val?.appUserId)
      .subscribe({
        next: (res) => {
          if (res.isUndefinedOrNullOrEmpty()) {
            this.selected.userRoleDtos = [];
            this.doDataInit();
            return;
          }
          this.selected.userRoleDtos = res;
          this.doDataInit();

          if (this.isAdmin) {
            this.modalServ.warning({
              nzTitle: '提醒您',
              nzContent: 'Admin 為最高權限使用帳號，不可變更指派權限。'
            });
          }
        },
        error: (err) => {
          this.bbdNotifyServ.error('執行失敗', err);
        }
      });
  }

  canSubmit() {
    if (!this.selected || !this.selected.emp) {
      this.bbdNotifyServ.error('指派失敗，請確認是否有選擇要指派的員工資料。');
      throw new Error("指派失敗");
    }

    if (this.selected.userRoleDtos.isUndefinedOrNullOrEmpty()) {
      this.bbdNotifyServ.error('指派失敗，請確認是否有選擇要指派的角色權限。');
      throw new Error("指派失敗");
    }

  }

  onToggleChange(role: AppRoleChecked, checked: boolean): void {
    if (!role) {
      return;
    }

    if (!this.selected.emp) {
      this.bbdNotifyServ.error('您未選擇要指派權限的員工。');
      return;
    }

    if (!this.selected.userRoleDtos) {
      this.selected.userRoleDtos = [];
    }

    const userRole = this.selected.userRoleDtos.find(item => item.appRoleId === role.id);

    if (checked) {
      if (userRole) {
        userRole.delAt = new Date().getAppMaxUtcDate();
      }
      else {
        const obj = new AppUserRoleDto();
        obj.appUserId = this.selected.emp.appUserId;
        obj.appRoleId = role.id;

        this.selected.userRoleDtos.push(obj);
      }
    } else {
      if (userRole) {
        if (userRole.id > 0) {
          userRole.delAt = new Date();
        } else {
          this.selected.userRoleDtos = this.selected.userRoleDtos.filter(item => item.appRoleId !== role.id);
        }
      }
    }
  }

  onSubmit(): void {
    this.canSubmit();
    this.spinnerServ.show();
    this._appRoleApiServ.setAppUserRoleDtos(this.selected.userRoleDtos)
      .subscribe({
        next: (res) => {
          if (!res) {
            this.bbdNotifyServ.error('指派失敗，請再重試一次。');
            return;
          }
          this.bbdNotifyServ.success('指派成功。');
        },
        error: (err) => {
          this.bbdNotifyServ.error('執行失敗', err);
        },
      }).add(() => this.spinnerServ.hide());
  }
}

interface AppRoleChecked extends AppRoleView {
  checked?: boolean;
}

class EmpRole {
  emp: any = null;
  userRoleDtos: AppUserRoleDto[] = [];
}
