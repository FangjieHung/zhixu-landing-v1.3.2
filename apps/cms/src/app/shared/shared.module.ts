import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Thired party packages
import { QuillModule } from 'ngx-quill';

// Custom packages
import { SharedModule as CoreSharedModule } from '@core/shared';
import {
  CmsImgPreviewComponent, CmsPageHeaderComponent, CmsSearchBarComponent,
  CmsImgUploadComponent, CmsTagEditComponent, CmsPdfUploadComponent,
  CmsQuillEditorComponent,
} from './components';

const CUST_MODULES = [CoreSharedModule];
const CUST_COMPONENTS = [CmsImgPreviewComponent,
  CmsPageHeaderComponent, CmsSearchBarComponent,
  CmsTagEditComponent, CmsPdfUploadComponent,
  CmsImgUploadComponent, CmsQuillEditorComponent
];

@NgModule({
  declarations: [
    ...CUST_COMPONENTS,
  ],
  imports: [
    CommonModule,
    FormsModule,
    QuillModule.forRoot(),
    ReactiveFormsModule,
    ...CUST_MODULES
  ],
  exports: [
    ...CUST_MODULES,
    ...CUST_COMPONENTS,
  ]
})
export class SharedModule { }
