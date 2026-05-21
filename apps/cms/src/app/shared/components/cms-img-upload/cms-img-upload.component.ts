import { Component, EventEmitter, Injector, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppAttachApiServ } from '@core/services';
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-img-upload',
  templateUrl: './cms-img-upload.component.html',
  styleUrls: ['./cms-img-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmsImgUploadComponent),
      multi: true
    }
  ]
})
export class CmsImgUploadComponent extends BBDBaseComponent implements OnInit, ControlValueAccessor {
  formData = new FormData();
  // IOs
  @Input() _attId = 0;
  @Input() maxImgHeight = '';
  @Input() isHighPixelImg = false;
  @Output() _attIdChange = new EventEmitter<number>();
  get attId(): number {
    return this._attId;
  }

  set attId(value: number) {
    this._attId = value;
    this.propagateChange(this._attId);
    this._attIdChange.emit(this._attId);
  }

  constructor(
    private appAttachApiServ: AppAttachApiServ,
    protected override injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    console.log();
  }

  writeValue(value: number) {
    if (value !== undefined) {
      this.attId = value;
    }
  }

  propagateChange = (_: any) => {
    console.log();
  };
  propagateTouched = (_: any) => {
    console.log();
  };

  registerOnChange(fn: (_: any) => void) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: any) => void) {
    this.propagateTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUploadFile(target: any): void {
    const files = target?.files;
    if (!files || files.length === 0) {
      this.messageServ.warning('提示，您未選取要上傳的檔案。');
      return;
    }
    this.formData = new FormData();
    Object.entries(this.formData).forEach(([key, value]) => {
      this.formData.append(key, value);
    });
    this.formData.append('file', files[0]);
    
    // this.spinnerServ.show();
    // const uploadServ = this.isHighPixelImg ?
    // this.appAttachApiServ.uploadHighPixelImgs(this.formData) :
    // this.appAttachApiServ.uploadAppFileInfos(this.formData);
    // uploadServ.subscribe({
    //   next: (res) => {
    //     if (!res) {
    //       this.messageServ.error('圖片上傳失敗，請再重試一次。');
    //       return;
    //     }

    //     this.messageServ.success('圖片上傳成功，請記得存檔。');
    //     this.attId = res[0].id;
    //     this._attIdChange.emit(this._attId);
    //   },
    //   error: (err) => {
    //     this.notificationServ.error(
    //       '執行失敗',
    //       `錯誤訊息：「${err?.error?.errorMessage}」`
    //     );
    //   },
    // }).add(() => this.spinnerServ.hide());
  }

  onDelAppFileAtt(): void {
    this.attId = 0;
    this._attIdChange.emit(this._attId);

    // 暫時不採用直接刪除，避免忘記存擋時圖片無法顯示
    // this.appAttachApiServ.delAppFileAtt(this.attId).subscribe({
    //   next: (res) => {
    //     if (!res) {
    //       this.messageServ.error('圖片刪除失敗，請再重試一次。');
    //       return;
    //     }

    //     this.messageServ.success('圖片刪除失敗成功。');
    //     this.attId = 0;
    //   },
    //   error: (err) => {
    //     this.notificationServ.error(
    //       '執行失敗',
    //       `錯誤訊息：「${err?.error?.errorMessage}」`
    //     );
    //   },
    // }).add(() => this.spinnerServ.hide());
  }
}
