import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';

export const loginRoutes: Routes = [{ path: '**', component: LoginComponent }];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(loginRoutes),
  ],
  providers: [Http],
})
export class LoginModule {}
