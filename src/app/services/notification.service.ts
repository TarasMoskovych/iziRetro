import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { AuthError } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  showMessage(msg: string): void {
    this.snackBar.open(msg, 'Ok', {
      duration: 2000,
    });
  }

  handleError(err: AuthError): Observable<AuthError> {
    this.showMessage(err.message);
    return throwError(err);
  }
}
