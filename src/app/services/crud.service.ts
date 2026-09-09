// import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
// import { eExceptions, Resources } from '@dynamics/dynamics.constants';
// import { CrudConfig, FormConfig, FormInput, PageConfig, ResourceRequest, TableConfig } from '@dynamics/dynamics.interface';
// import { DyFormPopupComponent } from '@dynamics/forms/dy-form-popup/dy-form-popup.component';
// import { Modules, Operations, Urls } from '@urls';
// import { Subscription } from 'rxjs';
// import { DataService } from './data.service';
// import { ResourcesService } from './resources.service';

// @Injectable()
// export class CrudService implements OnDestroy {
//   private resourceSubscription: Subscription;
//   private crudformSubscription: Subscription;
//   public changeDetector: ChangeDetectorRef;
//   // public formPopup: DyFormPopupComponent;

//   filterValue = '';

//   filterDataConfig = {};
//   isReport = false;
//   isDocument = false;
//   reloadData = false;
//   enableTable = false;
//   enableCreate = false;

//   // currentPageConfig: PageConfig;
//   // tablePageConfig: PageConfig;
//   // fromPageConfig: PageConfig;
//   // dashPageConfig: PageConfig;

//   // formInput: FormInput;
//   printData: any;
//   documentData: {};

//   constructor(public dataService: DataService, public resourcesService: ResourcesService) {
//     this.resourceSubscription = this.resourcesService.resourceSubject.subscribe(() => { this.onPublish(); });
//   }

//   onFormConfiguration() {
//     if (!this.fromPageConfig) {
//       if (sessionStorage.FromPageConfig) {
//         this.fromPageConfig = JSON.parse(sessionStorage.FromPageConfig);
//       } else {
//         this.fromPageConfig = { formConfig: new FormConfig(), tableConfig: new TableConfig() };
//         this.dataService
//           .getData<CrudConfig>(Modules.Crud, Resources.From.resourceName)
//           .then((response) => {
//             this.fromPageConfig.formConfig = response.form;
//             this.fromPageConfig.tableConfig = response.table;
//             sessionStorage.FromPageConfig = JSON.stringify(this.fromPageConfig);
//           });
//       }
//     }
//   }

//   onDashConfiguration() {
//     if (!this.dashPageConfig) {
//       if (sessionStorage.DashPageConfig) {
//         this.dashPageConfig = JSON.parse(sessionStorage.DashPageConfig);
//       } else {
//         this.dashPageConfig = { formConfig: new FormConfig(), tableConfig: new TableConfig() };
//         this.dataService
//           .getData<CrudConfig>(Modules.Crud, Resources.Dashboard.resourceName)
//           .then((response) => {
//             this.dashPageConfig.formConfig = response.form;
//             this.dashPageConfig.tableConfig = response.table;
//             sessionStorage.DashPageConfig = JSON.stringify(this.dashPageConfig);
//           });
//       }
//     }
//   }

//   onTableConfiguration() {
//     if (!this.tablePageConfig) {
//       if (sessionStorage.TablePageConfig) {
//         this.tablePageConfig = JSON.parse(sessionStorage.TablePageConfig);
//       } else {
//         this.tablePageConfig = { formConfig: new FormConfig(), tableConfig: new TableConfig() };
//         this.dataService
//           .getData<CrudConfig>(Modules.Crud, Resources.Table.resourceName)
//           .then((response) => {
//             this.tablePageConfig.formConfig = response.form;
//             this.tablePageConfig.tableConfig = response.table;
//             sessionStorage.TablePageConfig = JSON.stringify(this.tablePageConfig);
//           });
//       }
//     }
//   }

//   onPublish() {
//     this.currentPageConfig = { formConfig: new FormConfig(), tableConfig: new TableConfig() };
//     this.dataService
//       .getData<CrudConfig>(Modules.Crud, this.resourcesService.resourceRequest.resourceName)
//       .then((response) => {
//         this.currentPageConfig = { formConfig: response.form, tableConfig: response.table, dashConfig: response.dashboard };
//         if (this.resourcesService.isUniversalMaster) {
//           if (response.dashboard) { this.onDashConfiguration(); }
//           else { this.onFormConfiguration(); this.onTableConfiguration(); }
//         }
//         this.enableTable = this.currentPageConfig.tableConfig && this.resourcesService.accessDetails && this.resourcesService.accessDetails.isView;
//         this.enableCreate = this.currentPageConfig.formConfig && this.resourcesService.accessDetails && this.resourcesService.accessDetails.isCreate;
//         this.detectChanges();
//       });
//   }

//   onOpenForm(): void {
//     this.isDocument = false;
//     if (this.formInput.formConfig && this.formInput.formConfig.properties) {
//       this.reloadData = false;
//       this.formPopup.show(this.formInput, this.resourcesService.accessDetails);
//       this.crudformSubscription = this.formPopup.submit.subscribe((returnData: any) => {
//         if (this.isReport) { this.filterDataConfig = returnData; } else { this.reloadData = true; }
//         if (this.currentPageConfig.formConfig && this.formInput.formConfig.name !== this.currentPageConfig.formConfig.name) { this.onPublish(); }
//         if (this.crudformSubscription) { this.crudformSubscription.unsubscribe(); }
//         this.detectChanges();
//       });
//     }
//     setTimeout(() => this.detectChanges(), 750);
//   }

//   onCrudAddUpdate(data: any = {}) {
//     this.formInput = { formConfig: this.currentPageConfig.formConfig, formData: data };
//     this.onOpenForm();
//   }

//   onEditFormConfig(): void {
//     if (this.fromPageConfig) {
//       this.formInput = { formConfig: this.fromPageConfig.formConfig, formData: this.currentPageConfig.formConfig };
//       this.onOpenForm();
//     }
//   }

//   onEditTableConfig(): void {
//     if (this.tablePageConfig) {
//       this.formInput = { formConfig: this.tablePageConfig.formConfig, formData: this.currentPageConfig.tableConfig };
//       this.onOpenForm();
//     }
//   }

//   onEditDashConfig(): void {
//     if (this.dashPageConfig) {
//       this.formInput = { formConfig: this.dashPageConfig.formConfig, formData: this.currentPageConfig.dashConfig };
//       this.onOpenForm();
//     }
//   }

//   onOpenDocument(event: any): void {
//     const docUrl = this.currentPageConfig.formConfig && this.currentPageConfig.formConfig.submitUrl
//       ? this.currentPageConfig.formConfig.submitUrl : event.dataUrl ? event.dataUrl : '';

//     if (docUrl) {
//       this.documentData = event.data;
//       this.dataService
//         .get<any>(`${Urls.Base}${docUrl}${Operations.Document}`, event.data.id)
//         .then((resp) => {
//           if (resp.status === eExceptions.Success) {
//             this.printData = resp.data;
//             this.isDocument = true;
//             this.detectChanges();
//           }
//         });
//     }
//   }

//   onRemovePage() {
//     this.dataService.delete<any>(Modules.Navigations, this.resourcesService.accessDetails.id).then(() => { this.detectChanges(); })
//   }

//   onCloseForm(): void {
//     this.reloadData = true;
//     this.isDocument = false;
//     this.detectChanges();
//   }

//   detectChanges(): void {
//     if (this.changeDetector) {
//       this.changeDetector.detectChanges();
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.resourceSubscription) { this.resourceSubscription.unsubscribe(); }
//     if (this.crudformSubscription) { this.crudformSubscription.unsubscribe(); }
//   }
// }
