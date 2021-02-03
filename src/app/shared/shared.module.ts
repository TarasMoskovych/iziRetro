import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    FilterPipe,
    AutofocusDirective,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule
  ],
})
export class SharedModule { }
