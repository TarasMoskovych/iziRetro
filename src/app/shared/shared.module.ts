import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';

import { FilterPipe } from './pipes';
import { AutofocusDirective } from './directives';

@NgModule({
  declarations: [
    FilterPipe,
    AutofocusDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    OrderModule,
  ],
  exports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    OrderModule,
    FilterPipe,
    AutofocusDirective,
  ],
})
export class SharedModule { }
