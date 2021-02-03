import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent, RegisterComponent } from './components';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
})
export class AuthModule { }
